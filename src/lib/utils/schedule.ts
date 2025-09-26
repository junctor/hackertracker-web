import type { HTEvent, HTTag, HTTagGroup } from "@/types/db";
import type { GroupedSchedule, ProcessedEvent, ProcessedTag } from "@/types/ht";

/* ---------- tiny date helpers (fixed-format inputs) ---------- */

// "+0000"/"-0000" -> "Z"; "+HHMM" -> "+HH:MM"
const normalizeOffset = (s: string) =>
  /[+-]0000$/.test(s)
    ? s.replace(/[+-]0000$/, "Z")
    : s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");

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
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
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
    timeZone
  );

// Friendly labels from a day key
export const fmtTab = (key: string, timeZone?: string) =>
  getFmt({ timeZone, weekday: "short", month: "short", day: "numeric" }).format(
    dateFromDayKey(key)
  );

export const fmtHeading = (key: string, timeZone?: string) =>
  getFmt({ timeZone, weekday: "long", month: "long", day: "numeric" }).format(
    dateFromDayKey(key)
  );

/* ---------------- data shaping ---------------- */

const toSeconds = (ts?: { seconds?: number } | null) =>
  ts && typeof ts.seconds === "number" ? ts.seconds : null;

export const buildAllTagIndex = (groups: readonly HTTagGroup[]) => {
  const idx = new Map<number, HTTag>();
  for (const g of groups) for (const t of g.tags) idx.set(t.id, t);
  return idx;
};

export function toProcessedEvent(
  ev: HTEvent,
  tagIdx: ReadonlyMap<number, HTTag>
): ProcessedEvent {
  const tags: ProcessedTag[] = (ev.tag_ids ?? [])
    .map((id) => tagIdx.get(id))
    .filter((t): t is HTTag => !!t)
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

  return {
    id: ev.id,
    title: ev.title ?? "",
    description: ev.description ?? "",
    begin: ev.begin ?? "",
    end: ev.end ?? null,
    beginTimestampSeconds: beginSec,
    endTimestampSeconds: endSec,
    timeZone: ev.timezone ?? "UTC",
    color: ev.type?.color ?? tags[0]?.color_background ?? null,
    tags,
    speakers:
      (ev.speakers ?? [])
        .map((s) => s?.name)
        .filter(Boolean)
        .join(", ") || null,
    location: ev.location?.name ?? null,
    links: ev.links ?? [],
  };
}

export const processScheduleData = (
  events: readonly HTEvent[],
  tagTypes: readonly HTTagGroup[]
) => {
  const tagIdx = buildAllTagIndex(tagTypes);
  return (events ?? []).map((ev) => toProcessedEvent(ev, tagIdx));
};

/* ---------------- grouping ---------------- */

export function createDateGroup(
  processed: readonly ProcessedEvent[],
  timeZone = "UTC"
): GroupedSchedule {
  const groups: GroupedSchedule = {};

  // Always prefer epoch for ordering; else parse the fixed-format string once
  const epoch = (ev: ProcessedEvent) =>
    ev.beginTimestampSeconds ??
    (ev.begin && typeof ev.begin === "string"
      ? Math.floor(parseFixedIso(ev.begin).getTime() / 1000)
      : Number.MAX_SAFE_INTEGER);

  // Sort once globally
  const sorted = [...processed].sort((a, b) => epoch(a) - epoch(b));

  // Build groups with the most stable source available
  for (const ev of sorted) {
    const key =
      ev.beginTimestampSeconds != null
        ? dayKey(ev.beginTimestampSeconds * 1000, timeZone)
        : dayKey(ev.begin, timeZone);

    (groups[key] ??= []).push(ev);
  }

  // Ensure each day’s list is ordered (cheap since mostly sorted)
  for (const list of Object.values(groups))
    list.sort((a, b) => epoch(a) - epoch(b));

  return groups;
}

export const buildScheduleBucketsByDay = (
  events: readonly HTEvent[],
  tags: readonly HTTagGroup[],
  timeZone = "UTC"
): GroupedSchedule =>
  createDateGroup(processScheduleData(events, tags), timeZone);
