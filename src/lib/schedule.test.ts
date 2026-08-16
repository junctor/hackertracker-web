import { describe, expect, it } from "vite-plus/test";

import type {
  Conference,
  Content,
  ContentSession,
  Location,
  Person,
  TagGroup,
} from "../types/hackertracker";

import { generateCalendar } from "./calendar";
import { buildScheduleBucketsByDay, processScheduleData } from "./schedule";

const session: ContentSession = {
  session_id: 8,
  begin_timestamp: { seconds: 1_754_640_400 },
  begin_tsz: "2025-08-08T17:00:00Z",
  end_timestamp: { seconds: 1_754_644_000 },
  end_tsz: "2025-08-08T18:00:00Z",
  timezone_name: "America/Los_Angeles",
  location_id: 3,
  channel_id: null,
  recordingpolicy_id: 1,
};

const content = {
  id: 42,
  title: "A useful talk",
  description: "Line one, line two",
  tag_ids: [2],
  people: [{ person_id: 5, sort_order: 0, tag_ids: [] }],
  sessions: [session],
  links: [],
  media: [],
  related_content_ids: null,
} as unknown as Content;

const tags = [
  {
    id: 1,
    category: "content",
    sort_order: 0,
    tags: [
      {
        id: 2,
        label: "Talk",
        description: "",
        sort_order: 0,
        color_background: "#017fa4",
        color_foreground: "#ffffff",
      },
    ],
  },
] as TagGroup[];

const person = { id: 5, name: "Ada Hacker" } as Person;
const location = { id: 3, name: "Track One" } as Location;

describe("schedule data", () => {
  it("joins speakers, locations, and content tags", () => {
    const [result] = processScheduleData([content], tags, [person], [location]);

    expect(result).toMatchObject({
      contentId: 42,
      sessionId: 8,
      speakers: "Ada Hacker",
      location: "Track One",
      color: "#017fa4",
    });
    expect(result?.tags.map((tag) => tag.label)).toEqual(["Talk"]);
  });

  it("groups sessions by the conference timezone", () => {
    const grouped = buildScheduleBucketsByDay(
      [content],
      tags,
      [person],
      [location],
      "America/Los_Angeles",
    );

    expect(Object.keys(grouped)).toEqual(["2025-08-08"]);
  });
});

describe("calendar export", () => {
  it("uses stable IDs, UTC dates, deep links, and escaped text", () => {
    const conference = { code: "DEFCON33" } as Conference;
    const calendar = generateCalendar(content, session, conference, "Track One", "Ada Hacker");

    expect(calendar).toContain("UID:DEFCON33-42-8@hackertracker.app");
    expect(calendar).toContain("DTSTART:20250808T170000Z");
    expect(calendar).toContain("URL:https://hackertracker.app/defcon33/content/42");
    expect(calendar).toContain("SUMMARY:A useful talk");
    expect(calendar).toContain("DESCRIPTION:Line one\\, line two\\\\nAda Hacker");
  });
});
