import type {
  Content,
  GroupedSchedule,
  Location,
  Person,
  ProcessedTag,
  ScheduledContent,
  Tag,
  TagGroup,
} from "../types/hackertracker";
import { toDate } from "./dates";
import { compareBySortOrder, sortOrderOf } from "./sort";

const normalizeOffset = (value: string) =>
  /[+-]0000$/.test(value)
    ? value.replace(/[+-]0000$/, "Z")
    : value.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
const parseFixedIso = (value: string) => new Date(normalizeOffset(value));
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  const cached = formatters.get(key);
  if (cached) return cached;
  let created: Intl.DateTimeFormat;
  try {
    created = new Intl.DateTimeFormat(undefined, options);
  } catch {
    const fallback = { ...options };
    delete fallback.timeZone;
    created = new Intl.DateTimeFormat(undefined, fallback);
  }
  formatters.set(key, created);
  return created;
}

function dayKey(value: string | number | Date, timeZone: string): string {
  const date =
    typeof value === "number"
      ? new Date(value)
      : value instanceof Date
        ? value
        : parseFixedIso(value);
  const parts = formatter({ timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});
  return `${parts.year ?? "1970"}-${parts.month ?? "01"}-${parts.day ?? "01"}`;
}

function dateFromDayKey(key: string): Date {
  const [year = 1970, month = 1, day = 1] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export const formatDayTab = (key: string, timeZone?: string) =>
  formatter({ timeZone, weekday: "short", month: "short", day: "numeric" }).format(
    dateFromDayKey(key),
  );

export const formatDayHeading = (key: string, timeZone?: string) =>
  formatter({ timeZone, weekday: "long", month: "long", day: "numeric" }).format(
    dateFromDayKey(key),
  );

interface IndexedTag {
  tag: Tag;
  group: TagGroup;
}

function buildTagIndex(groups: readonly TagGroup[]): Map<number, IndexedTag> {
  const index = new Map<number, IndexedTag>();
  for (const group of groups) for (const tag of group.tags) index.set(tag.id, { tag, group });
  return index;
}

function tagEntries(content: Content, index: ReadonlyMap<number, IndexedTag>): IndexedTag[] {
  return (content.tag_ids ?? [])
    .map((id) => index.get(id))
    .filter((entry): entry is IndexedTag => Boolean(entry))
    .sort(
      (a, b) =>
        compareBySortOrder(a.group, b.group) ||
        (a.group.label ?? "").localeCompare(b.group.label ?? "", undefined, {
          sensitivity: "base",
        }) ||
        compareBySortOrder(a.tag, b.tag) ||
        (a.tag.label ?? "").localeCompare(b.tag.label ?? "", undefined, { sensitivity: "base" }),
    );
}

export function getDisplayTags(content: Content, groups: readonly TagGroup[]): ProcessedTag[] {
  return tagEntries(content, buildTagIndex(groups)).map(({ tag }) => ({
    id: tag.id,
    label: tag.label,
    color_background: tag.color_background,
    color_foreground: tag.color_foreground,
    sort_order: tag.sort_order,
    sortOrder: sortOrderOf(tag) ?? undefined,
  }));
}

export function getAccentColor(content: Content, groups: readonly TagGroup[]): string | null {
  const entries = tagEntries(content, buildTagIndex(groups));
  return (
    entries.find(({ group }) => group.category === "content")?.tag.color_background ??
    entries[0]?.tag.color_background ??
    null
  );
}

export function getContentPersonIds(content: Content, people: readonly Person[] = []): number[] {
  const names = new Map(people.map((person) => [person.id, person.name]));
  return [...(content.people ?? [])]
    .sort(
      (a, b) =>
        compareBySortOrder(a, b) ||
        (names.get(a.person_id) ?? "").localeCompare(names.get(b.person_id) ?? "", undefined, {
          sensitivity: "base",
        }) ||
        a.person_id - b.person_id,
    )
    .map((role) => role.person_id);
}

export function processScheduleData(
  contents: readonly Content[],
  groups: readonly TagGroup[],
  people: readonly Person[] = [],
  locations: readonly Location[] = [],
  defaultTimeZone = "UTC",
): ScheduledContent[] {
  const tagIndex = buildTagIndex(groups);
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  return contents
    .flatMap((content) => {
      const entries = tagEntries(content, tagIndex);
      const tags = entries.map(({ tag }) => ({
        id: tag.id,
        label: tag.label,
        color_background: tag.color_background,
        color_foreground: tag.color_foreground,
        sort_order: tag.sort_order,
        sortOrder: sortOrderOf(tag) ?? undefined,
      }));
      const speakerNames = getContentPersonIds(content, people)
        .map((id) => peopleById.get(id)?.name)
        .filter((name): name is string => Boolean(name));
      const color =
        entries.find(({ group }) => group.category === "content")?.tag.color_background ??
        tags[0]?.color_background ??
        null;

      return (content.sessions ?? [])
        .filter((session) => Boolean(toDate(session.begin_tsz)))
        .map((session): ScheduledContent => ({
          contentId: content.id,
          sessionId: session.session_id,
          title: content.title ?? "",
          description: content.description ?? "",
          begin: session.begin_tsz,
          end: session.end_tsz || null,
          beginTimestampSeconds: session.begin_timestamp?.seconds ?? null,
          endTimestampSeconds: session.end_timestamp?.seconds ?? null,
          timeZone: session.timezone_name || defaultTimeZone,
          color,
          tags,
          speakers: speakerNames.length ? speakerNames.join(", ") : null,
          locationId: session.location_id ?? null,
          location: locationsById.get(session.location_id)?.name ?? null,
          sortOrder: sortOrderOf(session) ?? sortOrderOf(content),
        }));
    })
    .sort((a, b) => compareBySortOrder(a, b) || eventEpoch(a) - eventEpoch(b));
}

function eventEpoch(content: ScheduledContent): number {
  const epoch =
    content.beginTimestampSeconds ?? Math.floor(parseFixedIso(content.begin).getTime() / 1000);
  return Number.isFinite(epoch) ? epoch : Number.MAX_SAFE_INTEGER;
}

export function buildScheduleBucketsByDay(
  contents: readonly Content[],
  tags: readonly TagGroup[],
  people: readonly Person[] = [],
  locations: readonly Location[] = [],
  timeZone = "UTC",
): GroupedSchedule {
  const grouped: GroupedSchedule = {};
  for (const content of processScheduleData(contents, tags, people, locations, timeZone)) {
    const key = dayKey(
      content.beginTimestampSeconds === null ? content.begin : content.beginTimestampSeconds * 1000,
      timeZone,
    );
    (grouped[key] ??= []).push(content);
  }
  return grouped;
}
