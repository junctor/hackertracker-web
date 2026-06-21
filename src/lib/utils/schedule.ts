import type { ID, HTContent, HTLocation, HTPerson, HTTag, HTTagGroup } from "@/types/db";
import type {
  GroupedSchedule,
  ProcessedScheduledContent,
  ProcessedTag,
  ScheduledContent,
} from "@/types/ht";

/* ---------- tiny date helpers (fixed-format inputs) ---------- */

// "+0000"/"-0000" -> "Z"; "+HHMM" -> "+HH:MM"
const normalizeOffset = (s: string) =>
  /[+-]0000$/.test(s) ? s.replace(/[+-]0000$/, "Z") : s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");

// Parse our fixed format safely across engines
const parseFixedIso = (s: string) => new Date(normalizeOffset(s));

// Build a Date at UTC **noon** so formatting in any TZ stays on the same calendar day
const dateFromDayKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

// Cache Intl.DateTimeFormat instances (they’re relatively expensive)
const fmtCache = new Map<string, Intl.DateTimeFormat>();
const getFmt = (opts: Intl.DateTimeFormatOptions & { timeZone?: string }) => {
  const key = JSON.stringify(opts);
  let fmt = fmtCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(undefined, opts);
    fmtCache.set(key, fmt);
  }
  return fmt;
};

// YYYY-MM-DD in a target TZ (using parts to avoid locale parsing)
const ymdInTz = (dt: Date, timeZone: string) => {
  const parts = getFmt({
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dt);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) return "1970-01-01";
  return `${y}-${m}-${d}`;
};

// Stable grouping key
export const dayKey = (input: string | number | Date, timeZone = "UTC") =>
  ymdInTz(
    typeof input === "number"
      ? new Date(input)
      : input instanceof Date
        ? input
        : parseFixedIso(input),
    timeZone,
  );

// Friendly labels from a day key
export const fmtTab = (key: string, timeZone?: string) =>
  getFmt({ timeZone, weekday: "short", month: "short", day: "numeric" }).format(
    dateFromDayKey(key),
  );

export const fmtHeading = (key: string, timeZone?: string) =>
  getFmt({ timeZone, weekday: "long", month: "long", day: "numeric" }).format(dateFromDayKey(key));

/* ---------------- data shaping ---------------- */

const toSeconds = (ts?: { seconds?: number } | null) =>
  ts && typeof ts.seconds === "number" ? ts.seconds : null;

type IndexedTag = {
  tag: HTTag;
  group: HTTagGroup;
};

export const buildTagIndex = (groups: readonly HTTagGroup[]) => {
  const idx = new Map<number, IndexedTag>();
  for (const group of groups) {
    for (const tag of group.tags) idx.set(tag.id, { tag, group });
  }
  return idx;
};

function toProcessedTag(tag: HTTag): ProcessedTag {
  return {
    id: tag.id,
    label: tag.label,
    color_background: tag.color_background,
    color_foreground: tag.color_foreground,
    sort_order: tag.sort_order,
  };
}

function getContentTags(
  content: HTContent,
  tagIdx: ReadonlyMap<number, IndexedTag>,
): ProcessedTag[] {
  return (content.tag_ids ?? [])
    .map((id) => tagIdx.get(id))
    .filter((entry): entry is IndexedTag => entry !== undefined)
    .sort((a, b) => a.group.sort_order - b.group.sort_order || a.tag.sort_order - b.tag.sort_order)
    .map((entry) => toProcessedTag(entry.tag));
}

function getPrimaryContentTag(
  content: HTContent,
  tagIdx: ReadonlyMap<number, IndexedTag>,
): HTTag | null {
  const tags = (content.tag_ids ?? [])
    .map((id) => tagIdx.get(id))
    .filter((entry): entry is IndexedTag => entry !== undefined)
    .filter((entry) => entry.group.category === "content")
    .sort((a, b) => a.group.sort_order - b.group.sort_order || a.tag.sort_order - b.tag.sort_order);
  return tags[0]?.tag ?? null;
}

export function getContentDisplayTags(
  content: HTContent,
  tagGroups: readonly HTTagGroup[],
): ProcessedTag[] {
  return getContentTags(content, buildTagIndex(tagGroups));
}

export function getContentAccentColor(
  content: HTContent,
  tagGroups: readonly HTTagGroup[],
): string | null {
  const tagIdx = buildTagIndex(tagGroups);
  const tags = getContentTags(content, tagIdx);
  return (
    getPrimaryContentTag(content, tagIdx)?.color_background ?? tags[0]?.color_background ?? null
  );
}

export function getContentSessions(content: HTContent) {
  return content.sessions ?? [];
}

export function toScheduledContent(content: HTContent): ScheduledContent[] {
  return getContentSessions(content).map((session) => ({ content, session }));
}

export function toScheduledContents(contents: readonly HTContent[]): ScheduledContent[] {
  return contents.flatMap(toScheduledContent);
}

export function sortScheduledContentByStart(items: ScheduledContent[]): ScheduledContent[] {
  return [...items].sort((a, b) => {
    const aStart =
      toSeconds(a.session.begin_timestamp) ?? parseFixedIso(a.session.begin_tsz).getTime() / 1000;
    const bStart =
      toSeconds(b.session.begin_timestamp) ?? parseFixedIso(b.session.begin_tsz).getTime() / 1000;
    return aStart - bStart;
  });
}

export function getContentPrimarySession(content: HTContent) {
  return sortScheduledContentByStart(toScheduledContent(content))[0]?.session;
}

export function getContentPersonIds(content: HTContent): ID[] {
  return (content.people ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((person) => person.person_id);
}

export function getContentTagIds(content: HTContent): ID[] {
  return content.tag_ids ?? [];
}

function getSpeakerNames(
  content: HTContent,
  peopleById?: ReadonlyMap<number, HTPerson>,
): string | null {
  if (!peopleById) return null;
  const names = getContentPersonIds(content)
    .map((id) => peopleById.get(id)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(", ") : null;
}

export function toProcessedScheduledContent(
  item: ScheduledContent,
  tagIdx: ReadonlyMap<number, IndexedTag>,
  peopleById?: ReadonlyMap<number, HTPerson>,
  locationsById?: ReadonlyMap<number, HTLocation>,
): ProcessedScheduledContent {
  const { content, session } = item;
  const tags = getContentTags(content, tagIdx);
  const primaryTag = getPrimaryContentTag(content, tagIdx);
  const beginSec = toSeconds(session.begin_timestamp);
  const endSec = toSeconds(session.end_timestamp);

  return {
    contentId: content.id,
    sessionId: session.session_id,
    title: content.title ?? "",
    description: content.description ?? "",
    begin: session.begin_tsz,
    end: session.end_tsz,
    beginTimestampSeconds: beginSec,
    endTimestampSeconds: endSec,
    timeZone: session.timezone_name ?? "UTC",
    color: primaryTag?.color_background ?? tags[0]?.color_background ?? null,
    tags,
    speakers: getSpeakerNames(content, peopleById),
    location: locationsById?.get(session.location_id)?.name ?? null,
    locationId: session.location_id ?? null,
    links: content.links ?? [],
  };
}

export const processScheduleData = (
  contentItems: readonly HTContent[],
  tagTypes: readonly HTTagGroup[],
  people: readonly HTPerson[] = [],
  locations: readonly HTLocation[] = [],
) => {
  const tagIdx = buildTagIndex(tagTypes);
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  return sortScheduledContentByStart(toScheduledContents(contentItems)).map((item) =>
    toProcessedScheduledContent(item, tagIdx, peopleById, locationsById),
  );
};

/* ---------------- grouping ---------------- */

export function createDateGroup(
  processed: readonly ProcessedScheduledContent[],
  timeZone = "UTC",
): GroupedSchedule {
  const groups: GroupedSchedule = {};

  // Always prefer epoch for ordering; else parse the fixed-format string once
  const epoch = (content: ProcessedScheduledContent) =>
    content.beginTimestampSeconds ??
    (content.begin && typeof content.begin === "string"
      ? Math.floor(parseFixedIso(content.begin).getTime() / 1000)
      : Number.MAX_SAFE_INTEGER);

  // Sort once globally
  const sorted = [...processed].sort((a, b) => epoch(a) - epoch(b));

  // Build groups with the most stable source available
  for (const content of sorted) {
    const key =
      content.beginTimestampSeconds != null
        ? dayKey(content.beginTimestampSeconds * 1000, timeZone)
        : dayKey(content.begin, timeZone);

    (groups[key] ??= []).push(content);
  }

  // Ensure each day’s list is ordered (cheap since mostly sorted)
  for (const list of Object.values(groups)) list.sort((a, b) => epoch(a) - epoch(b));

  return groups;
}

export const buildScheduleBucketsByDay = (
  contentItems: readonly HTContent[],
  tags: readonly HTTagGroup[],
  people: readonly HTPerson[] = [],
  locations: readonly HTLocation[] = [],
  timeZone = "UTC",
): GroupedSchedule =>
  createDateGroup(processScheduleData(contentItems, tags, people, locations), timeZone);
