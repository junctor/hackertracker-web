import { describe, expect, it } from "vite-plus/test";

import { formatDateRange, timeZoneAbbreviation } from "./dates";

describe("conference date formatting", () => {
  it("collapses a single-day range", () => {
    const result = formatDateRange(
      new Date("2026-10-03T12:00:00Z"),
      new Date("2026-10-03T20:00:00Z"),
      "America/New_York",
    );

    expect(result).toBe("Oct 3, 2026");
  });

  it("uses the offset in effect on the conference date", () => {
    expect(timeZoneAbbreviation("America/Los_Angeles", "2026-08-07T12:00:00Z")).toBe("PDT");
    expect(timeZoneAbbreviation("America/Los_Angeles", "2026-01-07T12:00:00Z")).toBe("PST");
  });
});
