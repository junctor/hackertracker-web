export function toDate(
  v?: string | Date | { seconds: number; nanoseconds?: number } | null
) {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  if ("seconds" in v) return new Date(v.seconds * 1000);
  return undefined;
}

export function formatDateRange(
  start?: Date,
  end?: Date,
  timeZone?: string
): string | undefined {
  if (!start && !end) return undefined;

  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone,
  };
  const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };

  if (start && end) {
    const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
    const fmtA = new Intl.DateTimeFormat(
      undefined,
      sameYear ? opts : yearOpts
    ).format(start);
    const fmtB = new Intl.DateTimeFormat(undefined, yearOpts).format(end);
    return `${fmtA}–${fmtB}`;
  }
  const d = start ?? end!;
  return new Intl.DateTimeFormat(undefined, yearOpts).format(d);
}

export function tzAbbrev(timeZone?: string): string | undefined {
  if (!timeZone) return undefined;
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone,
      timeZoneName: "short",
      month: "short",
      day: "numeric",
    })
      .formatToParts(new Date("2025-01-01T12:00:00Z"))
      .find((p) => p.type === "timeZoneName")?.value;
    return parts;
  } catch {
    return undefined;
  }
}
