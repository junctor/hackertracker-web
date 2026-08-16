import type {
  Content,
  ContentSession,
  GroupedSchedule,
  Location,
  Person,
  ProcessedTag,
  ScheduledContent,
  Tag,
  TagGroup,
} from "../types/hackertracker";

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
  const created = new Intl.DateTimeFormat(undefined, options);
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
    .sort((a, b) => a.group.sort_order - b.group.sort_order || a.tag.sort_order - b.tag.sort_order);
}

export function getDisplayTags(content: Content, groups: readonly TagGroup[]): ProcessedTag[] {
  return tagEntries(content, buildTagIndex(groups)).map(({ tag }) => ({
    id: tag.id,
    label: tag.label,
    color_background: tag.color_background,
    color_foreground: tag.color_foreground,
    sort_order: tag.sort_order,
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

export function getContentPersonIds(content: Content): number[] {
  return [...(content.people ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((role) => role.person_id);
}

export function sortedSessions(content: Content): ContentSession[] {
  return [...(content.sessions ?? [])].sort(
    (a, b) =>
      (a.begin_timestamp?.seconds ?? parseFixedIso(a.begin_tsz).getTime() / 1000) -
      (b.begin_timestamp?.seconds ?? parseFixedIso(b.begin_tsz).getTime() / 1000),
  );
}

export function processScheduleData(
  contents: readonly Content[],
  groups: readonly TagGroup[],
  people: readonly Person[] = [],
  locations: readonly Location[] = [],
): ScheduledContent[] {
  const tagIndex = buildTagIndex(groups);
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  return contents
    .flatMap((content) =>
      (content.sessions ?? []).map((session): ScheduledContent => {
        const entries = tagEntries(content, tagIndex);
        const tags = entries.map(({ tag }) => ({
          id: tag.id,
          label: tag.label,
          color_background: tag.color_background,
          color_foreground: tag.color_foreground,
          sort_order: tag.sort_order,
        }));
        const speakerNames = getContentPersonIds(content)
          .map((id) => peopleById.get(id)?.name)
          .filter((name): name is string => Boolean(name));
        return {
          contentId: content.id,
          sessionId: session.session_id,
          title: content.title ?? "",
          description: content.description ?? "",
          begin: session.begin_tsz,
          end: session.end_tsz || null,
          beginTimestampSeconds: session.begin_timestamp?.seconds ?? null,
          endTimestampSeconds: session.end_timestamp?.seconds ?? null,
          timeZone: session.timezone_name || "UTC",
          color:
            entries.find(({ group }) => group.category === "content")?.tag.color_background ??
            tags[0]?.color_background ??
            null,
          tags,
          speakers: speakerNames.length ? speakerNames.join(", ") : null,
          location: locationsById.get(session.location_id)?.name ?? null,
          locationId: session.location_id ?? null,
          links: content.links ?? [],
        };
      }),
    )
    .sort((a, b) => eventEpoch(a) - eventEpoch(b));
}

function eventEpoch(content: ScheduledContent): number {
  return (
    content.beginTimestampSeconds ??
    Math.floor(parseFixedIso(content.begin).getTime() / 1000) ??
    Number.MAX_SAFE_INTEGER
  );
}

export function buildScheduleBucketsByDay(
  contents: readonly Content[],
  tags: readonly TagGroup[],
  people: readonly Person[] = [],
  locations: readonly Location[] = [],
  timeZone = "UTC",
): GroupedSchedule {
  const grouped: GroupedSchedule = {};
  for (const content of processScheduleData(contents, tags, people, locations)) {
    const key = dayKey(
      content.beginTimestampSeconds === null ? content.begin : content.beginTimestampSeconds * 1000,
      timeZone,
    );
    (grouped[key] ??= []).push(content);
  }
  return grouped;
}
