import type { HTConference } from "@/types/db";
import type { ProcessedEvent } from "@/types/ht";

const BASEURL = "https://hackertracker.app";
const PRODID = "-//hackertracker//web Calendar 1.0//EN";
const MAX_LINE_LEN = 75;

/** Escape special chars per RFC 5545 */
const escapeICalText = (text = "") =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** Format a Date to iCal “YYYYMMDDTHHMMSSZ” in UTC */
export const formatICalDate = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
};

/** Fold long lines with a space prefix on continuations */
const foldLine = (line: string) => {
  if (line.length <= MAX_LINE_LEN) return line;
  const pieces: string[] = [];
  for (let pos = 0; pos < line.length; pos += MAX_LINE_LEN) {
    const chunk = line.slice(pos, pos + MAX_LINE_LEN);
    pieces.push(pos === 0 ? chunk : " " + chunk);
  }
  return pieces.join("\r\n");
};

/** Build a plain-text description including speakers */
const buildDescription = (event: ProcessedEvent) => {
  const speakers = event.speakers ?? "";
  return [event.description, speakers].filter(Boolean).join("\\n");
};

/** Generate a full iCal string for an event */
export const generateICal = (
  event: ProcessedEvent,
  conference: HTConference
): string => {
  const now = new Date();
  const dtstamp = formatICalDate(now);
  const dtstart = formatICalDate(new Date(event.begin));
  const dtend = formatICalDate(new Date(event.end ?? event.begin));
  const uid = `${conference.code}-${event.id}@hackertracker.app`;

  const lines = [
    "BEGIN:VCALENDAR",
    "METHOD:PUBLISH",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SEQUENCE:0`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    "STATUS:CONFIRMED",
    "CATEGORIES:CONFERENCE",
    `SUMMARY:${escapeICalText(event.title)}`,
    `URL:${BASEURL}/event?conf=${conference.code}&event=${event.id}`,
    `LOCATION:${escapeICalText(event.location ?? "")}`,
    `DESCRIPTION:${escapeICalText(buildDescription(event))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // fold and join
  return lines.map(foldLine).join("\r\n");
};

export default generateICal;
