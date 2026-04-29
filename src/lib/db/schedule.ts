import type { HTConference, HTEvent, HTTagGroup } from "@/types/db";
import type { GroupedSchedule } from "@/types/ht";

import { buildScheduleBucketsByDay } from "@/lib/utils/schedule";

import { CACHE_TTL_MS, getCached, getOrSetCached } from "./cache";
import { getCachedConferenceByCode, getConferenceByCode } from "./conferences";
import { getEvents } from "./events";
import { getTags } from "./tags";

type ConferenceSchedule = {
  conference: HTConference;
  grouped: GroupedSchedule;
};

const scheduleKey = (conf: string) => `schedule:${conf}`;

function isProcessedEvent(value: unknown): value is GroupedSchedule[string][number] {
  if (value === null || typeof value !== "object") return false;
  const candidate = value as { id?: unknown; title?: unknown };
  return typeof candidate.id === "number" && typeof candidate.title === "string";
}

function isGroupedSchedule(value: unknown): value is GroupedSchedule {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(
    (events) => Array.isArray(events) && events.every(isProcessedEvent),
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
      const [events, tags] = await Promise.all([getEvents(conf), getTags(conf)]);
      return buildScheduleBucketsByDay(
        events as HTEvent[],
        tags as HTTagGroup[],
        conference.timezone || "UTC",
      );
    },
    { ttlMs: CACHE_TTL_MS.schedule, validate: isGroupedSchedule },
  );

  return { conference, grouped };
}

export function filterScheduleByEventIds(
  grouped: GroupedSchedule,
  eventIds: ReadonlySet<number>,
): GroupedSchedule {
  const result: GroupedSchedule = {};

  for (const [day, events] of Object.entries(grouped)) {
    const filtered = events.filter((event) => eventIds.has(event.id));
    if (filtered.length > 0) result[day] = filtered;
  }

  return result;
}
