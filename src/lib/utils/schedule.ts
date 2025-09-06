import type { HTEvent, HTTag, HTTagGroup } from "@/types/db";
import type { GroupedSchedule, ProcessedEvent, ProcessedTag } from "@/types/ht";

export function buildAllTagIndex(
  tagTypes: readonly HTTagGroup[]
): Map<number, HTTag> {
  const idx = new Map<number, HTTag>();
  for (const group of tagTypes) for (const t of group.tags) idx.set(t.id, t);
  return idx;
}

const toSeconds = (ts?: { seconds?: number } | null): number | null =>
  ts && typeof ts.seconds === "number" ? ts.seconds : null;

export function toProcessedEvent(
  ev: HTEvent,
  tagIdx: ReadonlyMap<number, HTTag>
): ProcessedEvent {
  const matchedTags: ProcessedTag[] = (ev.tag_ids ?? [])
    .map((id) => tagIdx.get(id))
    .filter((t): t is HTTag => Boolean(t))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((t) => ({
      id: t.id,
      label: t.label,
      color_background: t.color_background,
      color_foreground: t.color_foreground,
      sort_order: t.sort_order,
    }));

  const beginSec = toSeconds(ev.begin_timestamp);
  const endSec = toSeconds(ev.end_timestamp);

  const rowColor =
    ev.type?.color ??
    (matchedTags.length ? matchedTags[0].color_background : null) ??
    null;

  const speakerNames = (ev.speakers ?? []).map((s) => s?.name).filter(Boolean);

  return {
    id: ev.id,
    title: ev.title ?? "",
    description: ev.description ?? "",
    begin: ev.begin ?? "",
    end: ev.end ?? null,
    beginTimestampSeconds: beginSec,
    endTimestampSeconds: endSec,
    timeZone: ev.timezone ?? "UTC",
    color: rowColor,
    tags: matchedTags,
    speakers: speakerNames.length ? speakerNames.join(", ") : null,
    location: ev.location?.name ?? null,
    links: ev.links ?? [],
  };
}

export function processScheduleData(
  events: readonly HTEvent[],
  tagTypes: readonly HTTagGroup[]
): ProcessedEvent[] {
  const tagIdx = buildAllTagIndex(tagTypes);
  return (events ?? []).map((ev) => toProcessedEvent(ev, tagIdx));
}

export function eventDay(
  input: string | number | Date,
  timezone?: string
): string {
  const timeZone = timezone ?? "UTC";
  const dt =
    typeof input === "string" || typeof input === "number"
      ? new Date(input)
      : input;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dt);
}

export function createDateGroup(
  processed: readonly ProcessedEvent[],
  timezone?: string
): GroupedSchedule {
  const timeZone = timezone ?? "UTC";
  const groups: GroupedSchedule = {};

  const sorted = [...processed].sort((a, b) => {
    const aSec =
      a.beginTimestampSeconds ??
      (a.begin
        ? Math.floor(Date.parse(String(a.begin)) / 1000)
        : Number.MAX_SAFE_INTEGER);
    const bSec =
      b.beginTimestampSeconds ??
      (b.begin
        ? Math.floor(Date.parse(String(b.begin)) / 1000)
        : Number.MAX_SAFE_INTEGER);
    return aSec - bSec;
  });

  for (const ev of sorted) {
    const key = eventDay(ev.begin, timeZone);
    const list = groups[key];
    if (list) list.push(ev);
    else groups[key] = [ev];
  }

  for (const [, list] of Object.entries(groups)) {
    list.sort((a, b) => {
      const aSec =
        a.beginTimestampSeconds ??
        (a.begin
          ? Math.floor(Date.parse(String(a.begin)) / 1000)
          : Number.MAX_SAFE_INTEGER);
      const bSec =
        b.beginTimestampSeconds ??
        (b.begin
          ? Math.floor(Date.parse(String(b.begin)) / 1000)
          : Number.MAX_SAFE_INTEGER);
      return aSec - bSec;
    });
  }

  return groups;
}

export function buildScheduleBucketsByDay(
  events: readonly HTEvent[],
  tags: readonly HTTagGroup[],
  timeZone?: string
): GroupedSchedule {
  const processed = processScheduleData(events, tags);
  return createDateGroup(processed, timeZone);
}
