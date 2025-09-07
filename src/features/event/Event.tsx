import { useEffect, useState } from "react";
import {
  getConferenceByCode,
  getEventById,
  getSpeakersByIds,
  getTags,
} from "@/lib/db";
import { toProcessedEvent } from "@/lib/utils/schedule";
import type { ProcessedEvent } from "@/types/ht";
import type {
  HTConference,
  HTEvent,
  HTPerson,
  HTTag,
  HTTagGroup,
} from "@/types/db";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import EventDetails from "./EventDetails";
import { useNormalizedParams } from "@/lib/utils/params";

export function Event() {
  const { confCode, eventId } = useNormalizedParams();

  const [event, setEvent] = useState<ProcessedEvent | null>(null);
  const [people, setPeople] = useState<HTPerson[]>([]);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [loading, setLoading] = useState(false);
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
    } else {
      setError(null);
    }
  }, [confCode, eventId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!confCode || !eventId) return;

      setLoading(true);
      setError(null);
      setEvent(null);
      setPeople([]);
      setConference(null);

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
                (evt as HTEvent).speakers!.map((s) => s.id)
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

    run();
    return () => {
      cancelled = true;
    };
  }, [confCode, eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-950">
        <main className="flex-1">
          <LoadingPage message="Loading event..." />
        </main>
        <HTFooter />
      </div>
    );
  }

  if (error && !conference) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-950">
        <main className="flex-1">
          <ErrorPage msg={error} />
        </main>
        <HTFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
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
