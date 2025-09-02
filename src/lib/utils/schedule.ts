import type { HTEvent, HTTag, HTTagGroup } from "@/types/db";
import type { GroupedSchedule, ProcessedEvent, ProcessedTag } from "@/types/ht";

/** Returns a Map of tagId -> HTTag for the chosen TagTypes group.
 *  Defaults to "Event Category" which aligns with event.tag_ids.
 */
export function buildAllTagIndex(
  tagTypes: readonly HTTagGroup[]
): Map<number, HTTag> {
  const idx = new Map<number, HTTag>();
  for (const group of tagTypes) {
    for (const t of group.tags) idx.set(t.id, t);
  }
  return idx;
}

const toSeconds = (ts?: { seconds?: number } | null): number | null =>
  ts && typeof ts.seconds === "number" ? ts.seconds : null;

export function toProcessedEvent(
  ev: HTEvent,
  tagTypes: readonly HTTagGroup[]
): ProcessedEvent {
  const tagIdx = buildAllTagIndex(tagTypes);

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

  // Prefer explicit event.type.color; fallback to first tag bg
  const rowColor =
    ev.type?.color ??
    (matchedTags.length ? matchedTags[0].color_background : null) ??
    null;

  const speakerNames = (ev.speakers ?? []).map((s) => s?.name).filter(Boolean);

  return {
    id: ev.id,
    title: ev.title ?? "",
    begin: ev.begin ?? "",
    end: ev.end ?? null,
    beginTimestampSeconds: beginSec,
    endTimestampSeconds: endSec,
    color: rowColor,
    tags: matchedTags,
    speakers: speakerNames.length ? speakerNames.join(", ") : null,
    location: ev.location?.name ?? null,
  };
}

export function processScheduleData(
  events: readonly HTEvent[],
  tagTypes: readonly HTTagGroup[]
): ProcessedEvent[] {
  const idx = buildAllTagIndex(tagTypes);

  return (events ?? []).map((ev) => {
    const matchedTags: ProcessedTag[] = (ev.tag_ids ?? [])
      .map((id) => idx.get(id))
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

    const speakerNames = (ev.speakers ?? [])
      .map((s) => s?.name)
      .filter(Boolean);

    return {
      id: ev.id,
      title: ev.title ?? "",
      begin: ev.begin ?? "",
      end: ev.end ?? null,
      beginTimestampSeconds: beginSec,
      endTimestampSeconds: endSec,
      color: rowColor,
      tags: matchedTags,
      speakers: speakerNames.length ? speakerNames.join(", ") : null,
      location: ev.location?.name ?? null,
    };
  });
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

  // 1) Sort all events oldest → newest BEFORE grouping
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
