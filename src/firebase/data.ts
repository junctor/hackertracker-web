import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore/lite";

import type {
  Conference,
  ConferenceArticle,
  ConferenceDocument,
  ConferenceMenu,
  ConferenceMenuItem,
  ConferenceSchedule,
  Content,
  GroupedSchedule,
  Location,
  Organization,
  Person,
  PersonSummary,
  TagGroup,
} from "../types/hackertracker";

import { buildScheduleBucketsByDay } from "../lib/schedule";
import { cacheTtl, cachedLoad, getCached, setCached, setMemoryCached } from "./cache";
import { db } from "./client";

const conferenceKey = (code: string) => `conference:${code}`;
const contentKey = (code: string) => `content:${code}`;
const contentItemKey = (code: string, id: number) => `content:${code}:${id}`;
const speakersKey = (code: string) => `speakers:${code}`;
const speakerIndexKey = (code: string) => `speaker-index:${code}`;
const scheduleSpeakerIndexKey = (code: string, ids: number[]) => {
  let hash = 2_166_136_261;
  for (const id of ids) {
    hash ^= id;
    hash = Math.imul(hash, 16_777_619);
  }
  return `schedule-speakers:${code}:${ids.length}:${(hash >>> 0).toString(36)}`;
};
const speakerKey = (code: string, id: number) => `speaker:${code}:${id}`;
const locationsKey = (code: string) => `locations:${code}`;
const tagsKey = (code: string) => `tags:${code}`;
const menusKey = (code: string) => `menus:${code}`;
const organizationsKey = (code: string) => `organizations:${code}`;
const documentsKey = (code: string) => `documents:${code}`;
const articlesKey = (code: string) => `articles:${code}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

const isConference = (value: unknown): value is Conference =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.code === "string" &&
  typeof value.name === "string" &&
  typeof value.timezone === "string";
const isConferenceList = (value: unknown): value is Conference[] =>
  Array.isArray(value) && value.every(isConference);
const isContent = (value: unknown): value is Content =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.title === "string" &&
  typeof value.description === "string" &&
  Array.isArray(value.tag_ids) &&
  Array.isArray(value.people) &&
  Array.isArray(value.sessions) &&
  value.sessions.every(
    (session) =>
      isRecord(session) &&
      typeof session.session_id === "number" &&
      typeof session.begin_tsz === "string",
  );
const isContentList = (value: unknown): value is Content[] =>
  Array.isArray(value) && value.every(isContent);
const isPerson = (value: unknown): value is Person =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.name === "string" &&
  Array.isArray(value.content_ids);
const isPersonList = (value: unknown): value is Person[] =>
  Array.isArray(value) && value.every(isPerson);
const isPersonSummary = (value: unknown): value is PersonSummary =>
  isRecord(value) && typeof value.id === "number" && typeof value.name === "string";
const isPersonSummaryList = (value: unknown): value is PersonSummary[] =>
  Array.isArray(value) && value.every(isPersonSummary);
const isLocationList = (value: unknown): value is Location[] =>
  Array.isArray(value) &&
  value.every(
    (item) => isRecord(item) && typeof item.id === "number" && typeof item.name === "string",
  );
const isTagGroupList = (value: unknown): value is TagGroup[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "number" &&
      typeof item.label === "string" &&
      typeof item.category === "string" &&
      Array.isArray(item.tags) &&
      item.tags.every(
        (tag) => isRecord(tag) && typeof tag.id === "number" && typeof tag.label === "string",
      ),
  );
const numberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const text = (value: unknown): string => (typeof value === "string" ? value : "");
const numberList = (value: unknown): number[] =>
  Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [];

function normalizeTagGroups(value: unknown): TagGroup[] {
  const candidates = Array.isArray(value) ? value : [value];
  return candidates.flatMap((candidate) => {
    if (!isRecord(candidate) || !Array.isArray(candidate.tags)) return [];
    const id = numberOrNull(candidate.id);
    const label = text(candidate.label);
    if (id === null || !label) return [];
    const category = text(candidate.category);
    const tags = candidate.tags.flatMap((tag) => {
      if (!isRecord(tag)) return [];
      const tagId = numberOrNull(tag.id);
      const tagLabel = text(tag.label);
      if (tagId === null || !tagLabel) return [];
      return [
        {
          id: tagId,
          label: tagLabel,
          description: text(tag.description),
          sort_order: numberOrNull(tag.sort_order) ?? Number.MAX_SAFE_INTEGER,
          color_background: text(tag.color_background),
          color_foreground: text(tag.color_foreground),
          sortOrder: numberOrNull(tag.sortOrder) ?? undefined,
        },
      ];
    });
    return [
      {
        id,
        uuid: text(candidate.uuid),
        well_known_uuid: text(candidate.well_known_uuid),
        label,
        category: ["content", "content-person", "orga", "orga-person"].includes(category)
          ? (category as TagGroup["category"])
          : "content",
        conference_id: numberOrNull(candidate.conference_id) ?? 0,
        conference: text(candidate.conference),
        is_browsable: Boolean(candidate.is_browsable),
        is_single_valued: Boolean(candidate.is_single_valued),
        sort_order: numberOrNull(candidate.sort_order) ?? Number.MAX_SAFE_INTEGER,
        sortOrder: numberOrNull(candidate.sortOrder) ?? undefined,
        tags,
      },
    ];
  });
}

function normalizeMenuItem(value: unknown): ConferenceMenuItem | null {
  if (!isRecord(value) || typeof value.id !== "number") return null;
  const prohibited = value.prohibit_tag_filter;
  return {
    id: value.id,
    titleText: text(value.title_text),
    function: text(value.function).trim().toLowerCase(),
    sortOrder:
      typeof value.sortOrder === "number"
        ? value.sortOrder
        : typeof value.sort_order === "number"
          ? value.sort_order
          : Number.MAX_SAFE_INTEGER,
    appleSfSymbol: text(value.apple_sfsymbol),
    googleMaterialSymbol: text(value.google_materialsymbol),
    appliedTagIds: numberList(value.applied_tag_ids),
    documentId: numberOrNull(value.document_id),
    menuId: numberOrNull(value.menu_id),
    prohibitTagFilter:
      prohibited === true || prohibited === 1 || String(prohibited).toLowerCase() === "true",
  };
}

function normalizeMenu(value: unknown): ConferenceMenu | null {
  if (!isRecord(value) || typeof value.id !== "number") return null;
  const items = Array.isArray(value.items)
    ? value.items
        .map(normalizeMenuItem)
        .filter((item): item is ConferenceMenuItem => item !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.titleText.localeCompare(b.titleText))
    : [];
  return {
    id: value.id,
    conference: text(value.conference),
    conferenceId: numberOrNull(value.conference_id) ?? 0,
    titleText: text(value.title_text),
    items,
  };
}

const isMenuList = (value: unknown): value is ConferenceMenu[] =>
  Array.isArray(value) && value.every((item) => isRecord(item) && Array.isArray(item.items));
const isOrganizationList = (value: unknown): value is Organization[] =>
  Array.isArray(value) &&
  value.every(
    (item) => isRecord(item) && typeof item.id === "number" && typeof item.name === "string",
  );

function validData<T>(value: unknown, validate: (candidate: unknown) => candidate is T): T | null {
  return validate(value) ? value : null;
}
const isDocumentList = (value: unknown): value is ConferenceDocument[] =>
  Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === "number");
const isArticleList = (value: unknown): value is ConferenceArticle[] =>
  Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === "number");

function normalizeDocument(value: unknown): ConferenceDocument | null {
  if (!isRecord(value) || typeof value.id !== "number") return null;
  return {
    id: value.id,
    titleText: text(value.title_text),
    bodyText: text(value.body_text),
    updatedAt: (value.updated as ConferenceDocument["updatedAt"]) ?? null,
  };
}

function normalizeArticle(value: unknown): ConferenceArticle | null {
  if (!isRecord(value) || typeof value.id !== "number") return null;
  return {
    id: value.id,
    name: text(value.name),
    text: text(value.text),
    updatedAt: (value.updated as ConferenceArticle["updatedAt"]) ?? null,
    sortOrder: numberOrNull(value.sortOrder ?? value.sort_order) ?? undefined,
  };
}

function cacheConferences(conferences: Conference[]): void {
  for (const conference of [...conferences].reverse())
    setMemoryCached(conferenceKey(conference.code), conference);
}

export async function getConferences(count = 50): Promise<Conference[]> {
  const key = `conferences:list:${count}`;
  return cachedLoad(
    key,
    cacheTtl.conferenceList,
    async () => {
      const snapshot = await getDocs(
        query(collection(db, "conferences"), orderBy("start_timestamp", "desc"), limit(count)),
      );
      return snapshot.docs.flatMap((item) => {
        const conference = validData(item.data(), isConference);
        return conference ? [conference] : [];
      });
    },
    isConferenceList,
    (conferences) => {
      setCached(key, conferences);
      cacheConferences(conferences);
    },
  );
}

export async function getUpcomingConferences(): Promise<Conference[]> {
  const key = "conferences:upcoming";
  return cachedLoad(
    key,
    cacheTtl.conferenceList,
    async () => {
      const snapshot = await getDocs(
        query(
          collection(db, "conferences"),
          where("end_timestamp", ">=", new Date()),
          orderBy("end_timestamp", "asc"),
          limit(50),
        ),
      );
      return snapshot.docs.flatMap((item) => {
        const conference = validData(item.data(), isConference);
        return conference ? [conference] : [];
      });
    },
    isConferenceList,
    (conferences) => {
      setCached(key, conferences);
      cacheConferences(conferences);
    },
  );
}

export function getCachedConference(code: string): Conference | undefined {
  return getCached(conferenceKey(code), cacheTtl.conference, isConference);
}

export async function getConference(code: string): Promise<Conference | null> {
  const cached = getCachedConference(code);
  if (cached) return cached;
  return cachedLoad(
    conferenceKey(code),
    cacheTtl.conference,
    async () => {
      const snapshot = await getDoc(doc(db, "conferences", code));
      return snapshot.exists() ? validData(snapshot.data(), isConference) : null;
    },
    (value): value is Conference | null => value === null || isConference(value),
  );
}

export async function getConferenceMenus(code: string): Promise<ConferenceMenu[]> {
  return cachedLoad(
    menusKey(code),
    cacheTtl.menus,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "menus"));
      return snapshot.docs
        .map((item) => normalizeMenu(item.data()))
        .filter((item): item is ConferenceMenu => item !== null);
    },
    isMenuList,
  );
}

export async function getOrganizations(code: string): Promise<Organization[]> {
  return cachedLoad(
    organizationsKey(code),
    cacheTtl.organizations,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "organizations"));
      return snapshot.docs.flatMap((item) => {
        const organization = validData(item.data(), (value): value is Organization =>
          isOrganizationList([value]),
        );
        return organization ? [organization] : [];
      });
    },
    isOrganizationList,
  );
}

export async function getDocuments(code: string): Promise<ConferenceDocument[]> {
  return cachedLoad(
    documentsKey(code),
    cacheTtl.documents,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "documents"));
      return snapshot.docs
        .map((item) => normalizeDocument(item.data()))
        .filter((item): item is ConferenceDocument => item !== null);
    },
    isDocumentList,
  );
}

export async function getDocument(code: string, id: number): Promise<ConferenceDocument | null> {
  return (await getDocuments(code)).find((item) => item.id === id) ?? null;
}

export async function getArticles(code: string): Promise<ConferenceArticle[]> {
  return cachedLoad(
    articlesKey(code),
    cacheTtl.articles,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "articles"));
      return snapshot.docs
        .map((item) => normalizeArticle(item.data()))
        .filter((item): item is ConferenceArticle => item !== null);
    },
    isArticleList,
  );
}

export function getCachedContentList(code: string): Content[] | undefined {
  return getCached(contentKey(code), cacheTtl.events, isContentList);
}

export function getCachedContent(code: string, id: number): Content | undefined {
  return (
    getCachedContentList(code)?.find((content) => content.id === id) ??
    getCached(contentItemKey(code, id), cacheTtl.events, isContent)
  );
}

export async function getAllContent(code: string): Promise<Content[]> {
  return cachedLoad(
    contentKey(code),
    cacheTtl.events,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "content"));
      return snapshot.docs.flatMap((item) => {
        const content = validData(item.data(), isContent);
        return content ? [content] : [];
      });
    },
    isContentList,
  );
}

export async function getContent(code: string, id: number): Promise<Content | null> {
  const cached = getCachedContent(code, id);
  if (cached) return cached;
  const snapshot = await getDoc(doc(db, "conferences", code, "content", String(id)));
  if (!snapshot.exists()) return null;
  const content = validData(snapshot.data(), isContent);
  if (!content) throw new Error("Content data is invalid.");
  setCached(contentItemKey(code, id), content);
  return content;
}

export async function getContentByIds(code: string, ids: number[]): Promise<Content[]> {
  if (!ids.length) return [];
  const cached = getCachedContentList(code);
  if (cached) {
    const byId = new Map(cached.map((content) => [content.id, content]));
    return ids.map((id) => byId.get(id)).filter((item): item is Content => Boolean(item));
  }
  const results = await Promise.all(ids.map((id) => getContent(code, id)));
  return results.filter((item): item is Content => item !== null);
}

export async function getSpeakers(code: string): Promise<Person[]> {
  return cachedLoad(
    speakersKey(code),
    cacheTtl.speakers,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "speakers"));
      return snapshot.docs.flatMap((item) => {
        const person = validData(item.data(), isPerson);
        return person ? [person] : [];
      });
    },
    isPersonList,
    (people) => {
      setCached(speakersKey(code), people);
      setCached(
        speakerIndexKey(code),
        people.map(({ id, name }) => ({ id, name })),
      );
    },
  );
}

function referencedSpeakerIds(content: Content[]): number[] {
  return [
    ...new Set(
      content.flatMap((item) =>
        item.people.flatMap((person) =>
          typeof person.person_id === "number" ? [person.person_id] : [],
        ),
      ),
    ),
  ].sort((a, b) => a - b);
}

function onlyReferencedPeople(people: PersonSummary[], ids: number[]): PersonSummary[] {
  const wanted = new Set(ids);
  return people.filter((person) => wanted.has(person.id));
}

function getCachedScheduleSpeakers(code: string, content: Content[]): PersonSummary[] | undefined {
  const ids = referencedSpeakerIds(content);
  if (!ids.length) return [];
  const fullPeople = getCachedSpeakers(code);
  if (fullPeople)
    return onlyReferencedPeople(
      fullPeople.map(({ id, name }) => ({ id, name })),
      ids,
    );
  const scheduleIndex = getCached(
    scheduleSpeakerIndexKey(code, ids),
    cacheTtl.speakers,
    isPersonSummaryList,
  );
  if (scheduleIndex) return scheduleIndex;
  const fullIndex = getCached(speakerIndexKey(code), cacheTtl.speakers, isPersonSummaryList);
  return fullIndex ? onlyReferencedPeople(fullIndex, ids) : undefined;
}

async function getScheduleSpeakers(code: string, content: Content[]): Promise<PersonSummary[]> {
  const ids = referencedSpeakerIds(content);
  if (!ids.length) return [];
  const cached = getCachedScheduleSpeakers(code, content);
  if (cached) return cached;
  return cachedLoad(
    scheduleSpeakerIndexKey(code, ids),
    cacheTtl.speakers,
    async () => {
      const chunks = Array.from({ length: Math.ceil(ids.length / 30) }, (_, index) =>
        ids.slice(index * 30, index * 30 + 30),
      );
      const snapshots = await Promise.all(
        chunks.map((chunk) =>
          getDocs(
            query(
              collection(db, "conferences", code, "speakers"),
              where(documentId(), "in", chunk.map(String)),
            ),
          ),
        ),
      );
      return snapshots.flatMap((snapshot) =>
        snapshot.docs.flatMap((item) => {
          const data: unknown = item.data();
          return isPersonSummary(data) ? [{ id: data.id, name: data.name }] : [];
        }),
      );
    },
    isPersonSummaryList,
  );
}

export function getCachedSpeakers(code: string): Person[] | undefined {
  return getCached(speakersKey(code), cacheTtl.speakers, isPersonList);
}

export async function getSpeaker(code: string, id: number): Promise<Person | null> {
  const cachedList = getCached(speakersKey(code), cacheTtl.speakers, isPersonList);
  const fromList = cachedList?.find((person) => person.id === id);
  if (fromList) return fromList;
  const cached = getCached(speakerKey(code, id), cacheTtl.speakers, isPerson);
  if (cached) return cached;
  const snapshot = await getDoc(doc(db, "conferences", code, "speakers", String(id)));
  if (!snapshot.exists()) return null;
  const person = validData(snapshot.data(), isPerson);
  if (!person) throw new Error("Person data is invalid.");
  setCached(speakerKey(code, id), person);
  return person;
}

export async function getSpeakersByIds(code: string, ids: number[]): Promise<Person[]> {
  if (!ids.length) return [];
  const cached = getCached(speakersKey(code), cacheTtl.speakers, isPersonList);
  if (cached) {
    const byId = new Map(cached.map((person) => [person.id, person]));
    return ids.map((id) => byId.get(id)).filter((item): item is Person => Boolean(item));
  }
  const results = await Promise.all(ids.map((id) => getSpeaker(code, id)));
  return results.filter((item): item is Person => item !== null);
}

export function getCachedLocations(code: string): Location[] | undefined {
  return getCached(locationsKey(code), cacheTtl.locations, isLocationList);
}

export async function getLocations(code: string): Promise<Location[]> {
  return cachedLoad(
    locationsKey(code),
    cacheTtl.locations,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "locations"));
      return snapshot.docs.flatMap((item) => {
        const location = validData(item.data(), (value): value is Location =>
          isLocationList([value]),
        );
        return location ? [location] : [];
      });
    },
    isLocationList,
  );
}

export function getCachedTags(code: string): TagGroup[] | undefined {
  return getCached(tagsKey(code), cacheTtl.tags, isTagGroupList);
}

export async function getTags(code: string): Promise<TagGroup[]> {
  return cachedLoad(
    tagsKey(code),
    cacheTtl.tags,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "tagtypes"));
      return snapshot.docs.flatMap((item) => normalizeTagGroups(item.data()));
    },
    isTagGroupList,
  );
}

interface DerivedScheduleCache {
  conference: Conference;
  content: Content[];
  tags: TagGroup[];
  people: PersonSummary[];
  locations: Location[];
  grouped: GroupedSchedule;
}

const derivedSchedules = new Map<string, DerivedScheduleCache>();

function deriveSchedule(
  conference: Conference,
  content: Content[],
  tags: TagGroup[],
  people: PersonSummary[],
  locations: Location[],
): ConferenceSchedule {
  const cached = derivedSchedules.get(conference.code);
  if (
    cached?.conference === conference &&
    cached.content === content &&
    cached.tags === tags &&
    cached.people === people &&
    cached.locations === locations
  )
    return { conference, grouped: cached.grouped };

  const grouped = buildScheduleBucketsByDay(
    content,
    tags,
    people,
    locations,
    conference.timezone || "UTC",
  );
  derivedSchedules.set(conference.code, { conference, content, tags, people, locations, grouped });
  return { conference, grouped };
}

export function getCachedConferenceSchedule(code: string): ConferenceSchedule | null {
  const conference = getCachedConference(code);
  const content = getCachedContentList(code);
  const tags = getCachedTags(code);
  const people = content ? getCachedScheduleSpeakers(code, content) : undefined;
  const locations = getCachedLocations(code);
  return conference && content && tags && people && locations
    ? deriveSchedule(conference, content, tags, people, locations)
    : null;
}

export async function getConferenceSchedule(code: string): Promise<ConferenceSchedule | null> {
  const conference = await getConference(code);
  if (!conference) return null;
  const [content, tags, locations] = await Promise.all([
    getAllContent(code),
    getTags(code),
    getLocations(code),
  ]);
  const people = await getScheduleSpeakers(code, content);
  return deriveSchedule(conference, content, tags, people, locations);
}

export function filterSchedule(
  grouped: GroupedSchedule,
  contentIds: ReadonlySet<number>,
): GroupedSchedule {
  return Object.fromEntries(
    Object.entries(grouped)
      .map(([day, items]) => [day, items.filter((item) => contentIds.has(item.contentId))] as const)
      .filter(([, items]) => items.length > 0),
  );
}
