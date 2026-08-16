import type { TimestampParts } from "../types/hackertracker";

type FirestoreTimestampLike = { toDate: () => Date };
export type DateLike = string | number | Date | TimestampParts | FirestoreTimestampLike | null;

function validDate(value: Date): Date | undefined {
  return Number.isNaN(value.getTime()) ? undefined : value;
}

export function toDate(value?: DateLike): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return validDate(value);
  if (typeof value === "string" || typeof value === "number") return validDate(new Date(value));
  if ("toDate" in value && typeof value.toDate === "function") return validDate(value.toDate());
  if (!("seconds" in value) || typeof value.seconds !== "number") return undefined;
  return validDate(
    new Date(value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1_000_000)),
  );
}

export function formatDateRange(start?: Date, end?: Date, timeZone?: string): string | undefined {
  if (!start && !end) return undefined;
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone };
  const withYear: Intl.DateTimeFormatOptions = { ...options, year: "numeric" };
  if (start && end) {
    const first = new Intl.DateTimeFormat(
      undefined,
      start.getUTCFullYear() === end.getUTCFullYear() ? options : withYear,
    ).format(start);
    return `${first}–${new Intl.DateTimeFormat(undefined, withYear).format(end)}`;
  }
  return new Intl.DateTimeFormat(undefined, withYear).format((start ?? end)!);
}

export function timeZoneAbbreviation(timeZone?: string): string | undefined {
  if (!timeZone) return undefined;
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      timeZoneName: "short",
      month: "short",
      day: "numeric",
    })
      .formatToParts(new Date("2025-01-01T12:00:00Z"))
      .find((part) => part.type === "timeZoneName")?.value;
  } catch {
    return undefined;
  }
}

function eventTime(date: Date, timeZone?: string, showZone = false): string {
  return new Intl.DateTimeFormat(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    ...(showZone ? { timeZoneName: "short" } : {}),
  }).format(date);
}

export function formatSessionTime(begin: Date, end: Date, timeZone?: string): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const beginDay = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(begin);
  const endDay = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(end);
  if (beginDay === endDay) {
    const date = new Intl.DateTimeFormat(undefined, dateOptions).format(begin);
    const start = eventTime(begin, timeZone);
    const finish = eventTime(end, timeZone, true);
    return start.slice(0, 5) === finish.slice(0, 5)
      ? `${date} at ${finish}`
      : `${date} at ${start} – ${finish}`;
  }
  const full: Intl.DateTimeFormatOptions = {
    ...dateOptions,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${new Intl.DateTimeFormat(undefined, full).format(begin)} – ${new Intl.DateTimeFormat(
    undefined,
    { ...full, timeZoneName: "short" },
  ).format(end)}`;
}

export function formatScheduleTime(value: string, timeZone?: string, showZone = false): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    ...(showZone ? { timeZoneName: "short" } : {}),
  }).format(new Date(value));
}
