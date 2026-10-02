import { describe, expect, it } from "vite-plus/test";

import type { Conference, ScheduledContent } from "../types/hackertracker";

import { generateCalendar } from "./calendar";

const conference = { code: "TEST" } as Conference;
const scheduled = {
  contentId: 1,
  sessionId: 2,
  title: "Résumé: 🔐 security and privacy across a deliberately long calendar title",
  description: "First line",
  speakers: "Zoë Example",
  begin: "2026-08-07T16:00:00Z",
  end: "2026-08-07T17:00:00Z",
  location: "Hall A",
} as ScheduledContent;

describe("iCalendar generation", () => {
  it("escapes newlines and folds every physical line to 75 UTF-8 octets", () => {
    const calendar = generateCalendar(scheduled, conference);

    expect(calendar).toContain("DESCRIPTION:First line\\nZoë Example");
    expect(calendar).not.toContain("DESCRIPTION:First line\\\\nZoë Example");
    for (const line of calendar?.split("\r\n") ?? []) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});
