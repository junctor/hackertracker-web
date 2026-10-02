import { describe, expect, it } from "vite-plus/test";

import type { Content, ContentSession } from "../types/hackertracker";

import { buildScheduleBucketsByDay, processScheduleData, scheduleDayKey } from "./schedule";

const session = (id: number, begin: string): ContentSession => ({
  session_id: id,
  begin_tsz: begin,
  end_tsz: new Date(new Date(begin).getTime() + 30 * 60_000).toISOString(),
  begin_timestamp: { seconds: Math.floor(new Date(begin).getTime() / 1000) },
  end_timestamp: { seconds: Math.floor(new Date(begin).getTime() / 1000) + 1800 },
  timezone_name: "America/Los_Angeles",
  location_id: 1,
  channel_id: null,
  recordingpolicy_id: 0,
});

const content = (
  id: number,
  title: string,
  sessions: ContentSession[],
  sortOrder: number,
): Content => ({
  id,
  title,
  description: "",
  tag_ids: [],
  people: [],
  sessions,
  links: [],
  logo: {},
  media: [],
  related_content_ids: null,
  feedback_form_id: null,
  feedback_enable_timestamp: null,
  feedback_enable_tsz: null,
  feedback_disable_timestamp: null,
  feedback_disable_tsz: null,
  updated_timestamp: { seconds: 0 },
  updated_tsz: "",
  sort_order: sortOrder,
});

describe("schedule processing", () => {
  it("sorts chronologically before using source sort order", () => {
    const result = processScheduleData(
      [
        content(1, "Later", [session(1, "2026-08-07T18:00:00Z")], 1),
        content(2, "Earlier", [session(2, "2026-08-07T16:00:00Z")], 999),
      ],
      [],
    );

    expect(result.map(({ title }) => title)).toEqual(["Earlier", "Later"]);
  });

  it("groups an instant by its date in the conference time zone", () => {
    const grouped = buildScheduleBucketsByDay(
      [content(1, "Late", [session(1, "2026-08-08T06:30:00Z")], 1)],
      [],
      [],
      [],
      "America/Los_Angeles",
    );

    expect(Object.keys(grouped)).toEqual(["2026-08-07"]);
    expect(scheduleDayKey("2026-08-08T06:30:00Z", "America/Los_Angeles")).toBe("2026-08-07");
  });
});
