import { useEffect, useState } from "react";

import type { HTConference, HTEvent, HTPerson, HTTag, HTTagGroup } from "@/types/db";
import type { ProcessedEvent } from "@/types/ht";

import { ConferenceHeader } from "@/components/ConferenceHeader";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import LoadingPage from "@/components/LoadingPage";
import {
  getCachedConferenceByCode,
  getCachedConferenceSchedule,
  getCachedEventById,
  getCachedTags,
  getConferenceByCode,
  getEventById,
  getSpeakersByIds,
  getTags,
} from "@/lib/db";
import { useNormalizedParams } from "@/lib/utils/params";
import { buildAllTagIndex, toProcessedEvent } from "@/lib/utils/schedule";

import EventDetails from "./EventDetails";

function getCachedEventDetails(confCode: string, eventId: number) {
  const schedule = getCachedConferenceSchedule(confCode);
  const event = schedule?.grouped
    ? Object.values(schedule.grouped)
        .flat()
        .find((candidate) => candidate.id === eventId)
    : null;
  if (schedule?.conference && event) return { conference: schedule.conference, event };

  const conference = getCachedConferenceByCode(confCode);
  const rawEvent = getCachedEventById(confCode, eventId);
  const tags = getCachedTags(confCode);
  if (!conference || !rawEvent || !tags) return null;

  return {
    conference,
    event: toProcessedEvent(rawEvent, buildAllTagIndex(tags)),
  };
}

export function Event() {
  const { confCode, eventId } = useNormalizedParams();
  const [initial] = useState(() =>
    confCode && eventId ? getCachedEventDetails(confCode, eventId) : null,
  );

  const [event, setEvent] = useState<ProcessedEvent | null>(initial?.event ?? null);
  const [people, setPeople] = useState<HTPerson[]>([]);
  const [conference, setConference] = useState<HTConference | null>(initial?.conference ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  // Title reflects state
  useEffect(() => {
    if (error && !conference) {
      document.title = "Error · Event | Hacker Tracker";
    } else if (loading) {
      document.title = "Loading event… | Hacker Tracker";
    } else if (conference && event) {
      document.title = `${event.title} · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "Event | Hacker Tracker";
    }
  }, [loading, conference, event, error]);

  // Validate required params early
  useEffect(() => {
    if (!confCode || !eventId) {
      setError("Missing required URL parameters.");
      setLoading(false);
    } else {
      setError(null);
    }
  }, [confCode, eventId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!confCode || !eventId) return;

      setError(null);

      const cachedDetails = getCachedEventDetails(confCode, eventId);

      if (cachedDetails) {
        setConference(cachedDetails.conference);
        setEvent(cachedDetails.event);
        setPeople([]);
        setLoading(false);
      } else {
        setLoading(true);
        setEvent(null);
        setPeople([]);
        setConference(null);
      }

      try {
        const conf = await getConferenceByCode(confCode);
        if (cancelled) return;
        if (!conf) {
          setError("Conference not found");
          return;
        }
        setConference(conf);

        const evt = await getEventById(confCode, Number(eventId));
        if (cancelled) return;
        if (!evt) {
          setError("Event not found");
          return;
        }

        const [tags, speakers] = await Promise.all([
          getTags(confCode),
          (evt as HTEvent).speakers?.length
            ? getSpeakersByIds(
                confCode,
                (evt as HTEvent).speakers!.map((s) => s.id),
              )
            : Promise.resolve([] as HTPerson[]),
        ]);
        if (cancelled) return;

        const tagMap = new Map<number, HTTag>();
        (tags as HTTagGroup[]).forEach((group) => {
          group.tags?.forEach((t) => tagMap.set(t.id, t));
        });

        const processed = toProcessedEvent(evt as HTEvent, tagMap);

        setPeople(speakers);
        setEvent(processed);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load event";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [confCode, eventId]);

  if (loading && !conference && !event) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-950">
        <main className="flex-1">
          <LoadingPage message="Loading event..." />
        </main>
        <HTFooter />
      </div>
    );
  }

  if (error && !conference) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-950">
        <main className="flex-1">
          <ErrorPage msg={error} />
        </main>
        <HTFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <main className="flex-1">
        {conference && <ConferenceHeader conference={conference} />}
        {conference && event ? (
          <EventDetails event={event} conference={conference} people={people} />
        ) : error ? (
          <ErrorPage msg={error} />
        ) : null}
      </main>
      <HTFooter />
    </div>
  );
}
