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

const LOCALE = "en-US";
const TZ = "America/Los_Angeles";

export function eventTimeTable(value: string | Date, showTz = true): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString(LOCALE, {
    timeZone: TZ,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: showTz ? "short" : undefined,
  });
}

export function eventDayTable(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(LOCALE, {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function tabDateTitle(day: string): string {
  const date = new Date(day);
  date.setHours(8, 0, 0); // normalize so timezone shifts don’t move the date
  return date.toLocaleDateString(LOCALE, {
    timeZone: TZ,
    month: "short",
    day: "numeric",
  });
}

export function newsTime(time: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TZ,
    hour12: false,
    day: "numeric",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  return time.toLocaleTimeString(LOCALE, options);
}

function eventTime(dt: Date, showZone: boolean, tz?: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    ...(showZone ? { timeZoneName: "short" } : {}),
  }).format(dt);
}

export function formatSessionTime(
  begin: Date,
  end: Date,
  tz?: string,
  locale?: string
): string {
  const sameDate = begin.toDateString() === end.toDateString();

  if (sameDate) {
    const dateStr = begin.toLocaleDateString(locale, {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const startTime = eventTime(begin, false, tz, locale);
    const endTime = eventTime(end, true, tz, locale); // zone shown once at end

    // If exact same minute, collapse to single time with zone
    if (startTime.slice(0, 5) === endTime.slice(0, 5)) {
      return `${dateStr} at ${endTime}`;
    }
    return `${dateStr} at ${startTime} – ${endTime}`;
  }

  // Different dates: show both fully, zone on the second
  const left = begin.toLocaleString(locale, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const right = end.toLocaleString(locale, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return `${left} – ${right}`;
}
