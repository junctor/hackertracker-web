import type { HTConference } from "@/types/db";
import type { GroupedSchedule } from "@/types/ht";

import { buildScheduleBucketsByDay } from "@/lib/utils/schedule";

import { CACHE_TTL_MS, getCached, getOrSetCached } from "./cache";
import { getCachedConferenceByCode, getConferenceByCode } from "./conferences";
import { getContent } from "./content";
import { getLocations } from "./locations";
import { getSpeakers } from "./speakers";
import { getTags } from "./tags";

type ConferenceSchedule = {
  conference: HTConference;
  grouped: GroupedSchedule;
};

const scheduleKey = (conf: string) => `schedule-content:${conf}`;

function isProcessedScheduledContent(value: unknown): value is GroupedSchedule[string][number] {
  if (value === null || typeof value !== "object") return false;
  const candidate = value as {
    contentId?: unknown;
    sessionId?: unknown;
    title?: unknown;
  };
  return (
    typeof candidate.contentId === "number" &&
    typeof candidate.sessionId === "number" &&
    typeof candidate.title === "string"
  );
}

function isGroupedSchedule(value: unknown): value is GroupedSchedule {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(
    (events) => Array.isArray(events) && events.every(isProcessedScheduledContent),
  );
}

export function getCachedSchedule(conf: string): GroupedSchedule | undefined {
  return getCached<GroupedSchedule>(scheduleKey(conf), {
    ttlMs: CACHE_TTL_MS.schedule,
    validate: isGroupedSchedule,
  });
}

export function getCachedConferenceSchedule(conf: string): ConferenceSchedule | null {
  const conference = getCachedConferenceByCode(conf);
  const grouped = getCachedSchedule(conf);
  return conference && grouped ? { conference, grouped } : null;
}

export async function getConferenceSchedule(conf: string): Promise<ConferenceSchedule | null> {
  const conference = await getConferenceByCode(conf);
  if (!conference) return null;

  const grouped = await getOrSetCached(
    scheduleKey(conf),
    async () => {
      const [content, tags, people, locations] = await Promise.all([
        getContent(conf),
        getTags(conf),
        getSpeakers(conf),
        getLocations(conf),
      ]);
      return buildScheduleBucketsByDay(
        content,
        tags,
        people,
        locations,
        conference.timezone || "UTC",
      );
    },
    { ttlMs: CACHE_TTL_MS.schedule, validate: isGroupedSchedule },
  );

  return { conference, grouped };
}

export function filterScheduleByContentIds(
  grouped: GroupedSchedule,
  contentIds: ReadonlySet<number>,
): GroupedSchedule {
  const result: GroupedSchedule = {};

  for (const [day, scheduledContents] of Object.entries(grouped)) {
    const filtered = scheduledContents.filter((item) => contentIds.has(item.contentId));
    if (filtered.length > 0) result[day] = filtered;
  }

  return result;
}
