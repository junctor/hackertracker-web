import type { Conference, Content, ContentSession } from "../types/hackertracker";

import { contentPath } from "./routes";

const escapeText = (text = "") =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const formatDate = (date: Date): string =>
  `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(
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

export function generateCalendar(
  content: Content,
  session: ContentSession,
  conference: Conference,
  location?: string | null,
  speakers?: string | null,
): string {
  return [
    "BEGIN:VCALENDAR",
    "METHOD:PUBLISH",
    "VERSION:2.0",
    "PRODID:-//hackertracker//web Calendar 1.0//EN",
    "BEGIN:VEVENT",
    `UID:${conference.code}-${content.id}-${session.session_id}@hackertracker.app`,
    "SEQUENCE:0",
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(new Date(session.begin_tsz))}`,
    `DTEND:${formatDate(new Date(session.end_tsz))}`,
    "STATUS:CONFIRMED",
    "CATEGORIES:CONFERENCE",
    `SUMMARY:${escapeText(content.title)}`,
    `URL:https://hackertracker.app${contentPath(conference.code, content.id)}`,
    `LOCATION:${escapeText(location ?? "")}`,
    `DESCRIPTION:${escapeText([content.description, speakers ?? ""].filter(Boolean).join("\\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}
