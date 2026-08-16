import {
  collection,
  doc,
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
  TagGroup,
} from "../types/hackertracker";

import { buildScheduleBucketsByDay } from "../lib/schedule";
import { cacheTtl, cachedLoad, getCached, setCached } from "./cache";
import { db } from "./client";

const conferenceKey = (code: string) => `conference:${code}`;
const contentKey = (code: string) => `content:${code}`;
const contentItemKey = (code: string, id: number) => `content:${code}:${id}`;
const speakersKey = (code: string) => `speakers:${code}`;
const speakerKey = (code: string, id: number) => `speaker:${code}:${id}`;
const locationsKey = (code: string) => `locations:${code}`;
const tagsKey = (code: string) => `tags:${code}`;
const scheduleKey = (code: string) => `schedule-content:${code}`;
const menusKey = (code: string) => `menus:${code}`;
const organizationsKey = (code: string) => `organizations:${code}`;
const documentsKey = (code: string) => `documents:${code}`;
const articlesKey = (code: string) => `articles:${code}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

const isConference = (value: unknown): value is Conference =>
  isRecord(value) && typeof value.code === "string";
const isConferenceList = (value: unknown): value is Conference[] =>
  Array.isArray(value) && value.every(isConference);
const isContent = (value: unknown): value is Content =>
  isRecord(value) && typeof value.id === "number";
const isContentList = (value: unknown): value is Content[] =>
  Array.isArray(value) && value.every(isContent);
const isPerson = (value: unknown): value is Person =>
  isRecord(value) && typeof value.id === "number" && typeof value.name === "string";
const isPersonList = (value: unknown): value is Person[] =>
  Array.isArray(value) && value.every(isPerson);
const isLocationList = (value: unknown): value is Location[] =>
  Array.isArray(value) &&
  value.every(
    (item) => isRecord(item) && typeof item.id === "number" && typeof item.name === "string",
  );
const isTagGroupList = (value: unknown): value is TagGroup[] =>
  Array.isArray(value) && value.every((item) => isRecord(item) && Array.isArray(item.tags));
const isGroupedSchedule = (value: unknown): value is GroupedSchedule =>
  isRecord(value) &&
  !Array.isArray(value) &&
  Object.values(value).every(
    (items) =>
      Array.isArray(items) &&
      items.every(
        (item) =>
          isRecord(item) &&
          typeof item.contentId === "number" &&
          typeof item.sessionId === "number" &&
          typeof item.title === "string",
      ),
  );

const numberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const text = (value: unknown): string => (typeof value === "string" ? value : "");
const numberList = (value: unknown): number[] =>
  Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [];

function normalizeMenuItem(value: unknown): ConferenceMenuItem | null {
  if (!isRecord(value) || typeof value.id !== "number") return null;
  const prohibited = value.prohibit_tag_filter;
  return {
    id: value.id,
    titleText: text(value.title_text),
    function: text(value.function).trim().toLowerCase(),
    sortOrder: typeof value.sort_order === "number" ? value.sort_order : Number.MAX_SAFE_INTEGER,
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
  Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === "number");
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
  };
}

function cacheConferences(conferences: Conference[]): void {
  for (const conference of conferences) setCached(conferenceKey(conference.code), conference);
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
      return snapshot.docs.map((item) => item.data() as Conference);
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
      return snapshot.docs.map((item) => item.data() as Conference);
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
      return snapshot.exists() ? (snapshot.data() as Conference) : null;
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

export async function getConferenceMenu(
  code: string,
  menuId: number,
): Promise<ConferenceMenu | null> {
  return (await getConferenceMenus(code)).find((menu) => menu.id === menuId) ?? null;
}

export async function getOrganizations(code: string): Promise<Organization[]> {
  return cachedLoad(
    organizationsKey(code),
    cacheTtl.organizations,
    async () => {
      const snapshot = await getDocs(collection(db, "conferences", code, "organizations"));
      return snapshot.docs.map((item) => item.data() as Organization);
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

function getCachedContentList(code: string): Content[] | undefined {
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
      return snapshot.docs.map((item) => item.data() as Content);
    },
    isContentList,
  );
}

export async function getContent(code: string, id: number): Promise<Content | null> {
  const cached = getCachedContent(code, id);
  if (cached) return cached;
  const snapshot = await getDoc(doc(db, "conferences", code, "content", String(id)));
  if (!snapshot.exists()) return null;
  const content = snapshot.data() as Content;
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
      return snapshot.docs.map((item) => item.data() as Person);
    },
    isPersonList,
  );
}

export async function getSpeaker(code: string, id: number): Promise<Person | null> {
  const cachedList = getCached(speakersKey(code), cacheTtl.speakers, isPersonList);
  const fromList = cachedList?.find((person) => person.id === id);
  if (fromList) return fromList;
  const cached = getCached(speakerKey(code, id), cacheTtl.speakers, isPerson);
  if (cached) return cached;
  const snapshot = await getDoc(doc(db, "conferences", code, "speakers", String(id)));
  if (!snapshot.exists()) return null;
  const person = snapshot.data() as Person;
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
      return snapshot.docs.map((item) => item.data() as Location);
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
      return snapshot.docs.flatMap((item) => item.data() as unknown as TagGroup[]);
    },
    isTagGroupList,
  );
}

export function getCachedConferenceSchedule(code: string): ConferenceSchedule | null {
  const conference = getCachedConference(code);
  const grouped = getCached(scheduleKey(code), cacheTtl.schedule, isGroupedSchedule);
  return conference && grouped ? { conference, grouped } : null;
}

export async function getConferenceSchedule(code: string): Promise<ConferenceSchedule | null> {
  const conference = await getConference(code);
  if (!conference) return null;
  const grouped = await cachedLoad(
    scheduleKey(code),
    cacheTtl.schedule,
    async () => {
      const [content, tags, people, locations] = await Promise.all([
        getAllContent(code),
        getTags(code),
        getSpeakers(code),
        getLocations(code),
      ]);
      return buildScheduleBucketsByDay(
        content,
        tags,
        people,
        locations,
        conference.timezone || "UTC",
      );
    },
    isGroupedSchedule,
  );
  return { conference, grouped };
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
