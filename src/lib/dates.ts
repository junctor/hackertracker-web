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

export function toIsoDateTime(value?: DateLike): string | undefined {
  return toDate(value)?.toISOString();
}

export function formatDateTime(
  value: DateLike,
  timeZone?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string | undefined {
  const date = toDate(value);
  if (!date) return undefined;
  try {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }
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

export function formatScheduleTime(value: string, timeZone?: string, showZone = false): string {
  return (
    formatDateTime(value, timeZone, {
      hour: "numeric",
      minute: "2-digit",
      ...(showZone ? { timeZoneName: "short" } : {}),
    }) ?? "Time unavailable"
  );
}

export function formatDuration(start: DateLike, end: DateLike): string | undefined {
  const startTime = toDate(start)?.getTime();
  const endTime = toDate(end)?.getTime();
  if (startTime === undefined || endTime === undefined) return undefined;

  const totalMinutes = Math.round((endTime - startTime) / 60_000);
  if (totalMinutes < 1) return undefined;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(" ");
}
