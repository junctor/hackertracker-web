import type { HTConference } from "@/types/db";
import type { ProcessedEvent } from "@/types/ht";

export type ICalOpts = {
  productId?: string; // PRODID (default -//HackerTracker//Schedule//EN)
  method?:
    | "PUBLISH"
    | "REQUEST"
    | "CANCEL"
    | "ADD"
    | "REPLY"
    | "COUNTER"
    | "DECLINECOUNTER";
  now?: Date; // override DTSTAMP
  alarmMinutesBefore?: number; // optional single display alarm (>=0)
  // Optional URL builder for deep links to content pages
  urlForEvent?: (ev: ProcessedEvent, conf: HTConference) => string | undefined;
  // Domain used in UID: <eventId>@<domain>  (default `${conf.code}.hackertracker`)
  uidDomain?: string;
  // Optional calendar name/description
  name?: string;
  description?: string;
};

export function generateICalFromProcessed(
  events: ProcessedEvent | ProcessedEvent[],
  conference: HTConference,
  opts: ICalOpts = {}
): string {
  const list = Array.isArray(events) ? events : [events];

  const productId = opts.productId ?? "-//HackerTracker//Schedule//EN";
  const method = opts.method ?? "PUBLISH";

  const body: string[] = [];
  body.push("BEGIN:VCALENDAR");
  body.push("VERSION:2.0");
  body.push(fold("PRODID", productId));
  body.push("CALSCALE:GREGORIAN");
  body.push(fold("METHOD", method));
  if (opts.name) body.push(val("X-WR-CALNAME", escapeText(opts.name)));
  if (opts.description)
    body.push(val("X-WR-CALDESC", escapeText(opts.description)));

  for (const ev of list) {
    body.push(buildEventFromProcessed(ev, conference, opts));
  }

  body.push("END:VCALENDAR");
  return body.join(CRLF) + CRLF;
}

// Optional helper to trigger browser download
export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

// ------------ Implementation -------------------------------------------------

const CRLF = "\r\n";

function toDate(d: string | number | Date | null | undefined): Date | null {
  if (d == null) return null;
  return d instanceof Date ? d : new Date(d);
}

function msFromSeconds(seconds: number | null): number | null {
  return seconds == null ? null : seconds * 1000;
}

function ensureStart(ev: ProcessedEvent): Date {
  // Prefer explicit begin, else beginTimestampSeconds
  const date =
    toDate(ev.begin) ??
    (msFromSeconds(ev.beginTimestampSeconds)
      ? new Date(msFromSeconds(ev.beginTimestampSeconds)!)
      : null);
  if (!date) throw new Error(`Event ${ev.id} has no valid start time`);
  return date;
}

function ensureEnd(ev: ProcessedEvent, start: Date): Date {
  // Prefer explicit end, else endTimestampSeconds, else +60m default
  const fromEndField = toDate(ev.end);
  if (fromEndField) return fromEndField;
  const fromSeconds = msFromSeconds(ev.endTimestampSeconds);
  if (fromSeconds) return new Date(fromSeconds);
  return new Date(start.getTime() + 60 * 60 * 1000);
}

function fmtUtc(dt: Date): string {
  // YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    dt.getUTCFullYear().toString() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    "T" +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    pad(dt.getUTCSeconds()) +
    "Z"
  );
}

function escapeText(v: string): string {
  // RFC5545 §3.3.11: escape \ ; , and newline
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// Fold to 75 characters (octet-approx) with continuation lines
function foldLine(line: string): string {
  const limit = 75;
  if (line.length <= limit) return line;
  const out: string[] = [];
  for (let i = 0; i < line.length; i += limit) {
    const chunk = line.slice(i, i + limit);
    out.push(i === 0 ? chunk : " " + chunk);
  }
  return out.join(CRLF);
}

function fold(name: string, value: string): string {
  return foldLine(`${name}:${value}`);
}

function val(name: string, raw?: string): string {
  return raw && raw.length ? fold(name, raw) : "";
}

function buildEventFromProcessed(
  ev: ProcessedEvent,
  conf: HTConference,
  opts: ICalOpts
): string {
  const start = ensureStart(ev);
  const end = ensureEnd(ev, start);

  const dtStamp = fmtUtc(opts.now ?? new Date());
  const dtStart = fmtUtc(start);
  const dtEnd = fmtUtc(end);

  const uidDomain = opts.uidDomain ?? `${conf.code}.hackertracker`;
  const uid = `${ev.id}@${uidDomain}`;

  const title = ev.title || `Event ${ev.id}`;
  const location = ev.location ?? "";
  const speakers = ev.speakers ? `Speakers: ${ev.speakers}` : "";
  const tags = ev.tags?.length
    ? `Tags: ${ev.tags.map((t) => t.label).join(", ")}`
    : "";
  const zone = ev.timeZone || conf.timezone || "";
  const url = opts.urlForEvent ? opts.urlForEvent(ev, conf) : undefined;

  const descParts = [
    conf.name ? `Conference: ${conf.name} (${conf.code})` : undefined,
    speakers || undefined,
    tags || undefined,
    zone ? `Timezone: ${zone}` : undefined,
    url ? `Link: ${url}` : undefined,
  ].filter(Boolean) as string[];

  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(fold("UID", uid));
  lines.push(fold("DTSTAMP", dtStamp));
  lines.push(fold("DTSTART", dtStart));
  lines.push(fold("DTEND", dtEnd));
  lines.push(val("SUMMARY", escapeText(title)));
  if (location) lines.push(val("LOCATION", escapeText(location)));
  if (descParts.length)
    lines.push(val("DESCRIPTION", escapeText(descParts.join("\n"))));
  if (url) lines.push(fold("URL", escapeText(url)));

  if (
    typeof opts.alarmMinutesBefore === "number" &&
    Number.isFinite(opts.alarmMinutesBefore)
  ) {
    const mins = Math.max(0, Math.floor(opts.alarmMinutesBefore));
    lines.push("BEGIN:VALARM");
    lines.push(fold("TRIGGER", `-PT${mins}M`));
    lines.push("ACTION:DISPLAY");
    lines.push(val("DESCRIPTION", escapeText(title)));
    lines.push("END:VALARM");
  }

  lines.push("END:VEVENT");
  return lines.join(CRLF);
}
