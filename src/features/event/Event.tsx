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

  // Early validation of required params
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

      try {
        const [conf, evt, tags] = await Promise.all([
          getConferenceByCode(confCode),
          getEventById(confCode, Number(eventId)),
          getTags(confCode),
        ]);
        if (cancelled) return;

        if (!conf) {
          setConference(null);
          setEvent(null);
          setError("Conference not found");
          return;
        }
        if (!evt) {
          setConference(conf);
          setEvent(null);
          setError("Event not found");
          return;
        }

        // Safe extraction of speaker ids
        const speakerIds = (evt as HTEvent).speakers?.map((s) => s.id) ?? [];
        const speakers = speakerIds.length
          ? await getSpeakersByIds(confCode, speakerIds)
          : [];

        const tagMap = new Map<number, HTTag>();
        (tags as HTTagGroup[]).forEach((group) => {
          group.tags?.forEach((tag) => tagMap.set(tag.id, tag));
        });

        const processed = toProcessedEvent(evt as HTEvent, tagMap);

        setPeople(speakers);
        setConference(conf);
        setEvent(processed);

        // Set title without creating a fetch re-run dependency loop
        document.title = `${processed.title} - ${conf.name}`;
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

  // Loading
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

  // Fatal errors (no conference context)
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

  // Success (or event-specific error with conference present)
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
