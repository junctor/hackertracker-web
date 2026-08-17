import type { Conference, ScheduledContent } from "../types/hackertracker";

import { contentPath } from "./routes";

const escapeText = (text = "") =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const formatDate = (date: Date): string | null =>
  Number.isNaN(date.getTime())
    ? null
    : `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(
        date.getUTCDate(),
      ).padStart(2, "0")}T${String(date.getUTCHours()).padStart(2, "0")}${String(
        date.getUTCMinutes(),
      ).padStart(2, "0")}${String(date.getUTCSeconds()).padStart(2, "0")}Z`;

const fold = (line: string) =>
  line.length <= 75
    ? line
    : Array.from(
        { length: Math.ceil(line.length / 75) },
        (_, index) => `${index ? " " : ""}${line.slice(index * 75, index * 75 + 75)}`,
      ).join("\r\n");

const safeToken = (value: string | number) =>
  String(value)
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "event";

export function calendarFileName(session: ScheduledContent, conference: Conference): string {
  return `conf-${safeToken(conference.code)}-event-${safeToken(session.contentId)}-${safeToken(session.sessionId)}.ics`;
}

export function generateCalendar(session: ScheduledContent, conference: Conference): string | null {
  const start = formatDate(new Date(session.begin));
  const end = formatDate(new Date(session.end ?? session.begin));
  const stamp = formatDate(new Date());
  if (!start || !end || !stamp) return null;
  const uid = [conference.code, session.contentId, session.sessionId].map(safeToken).join("-");
  return [
    "BEGIN:VCALENDAR",
    "METHOD:PUBLISH",
    "VERSION:2.0",
    "PRODID:-//hackertracker//web Calendar 1.0//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@hackertracker.app`,
    "SEQUENCE:0",
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "STATUS:CONFIRMED",
    "CATEGORIES:CONFERENCE",
    `SUMMARY:${escapeText(session.title)}`,
    `URL:https://hackertracker.app${contentPath(conference.code, session.contentId)}`,
    `LOCATION:${escapeText(session.location ?? "")}`,
    `DESCRIPTION:${escapeText([session.description, session.speakers ?? ""].filter(Boolean).join("\\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}
