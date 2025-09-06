import { useEffect, useState, Suspense, startTransition } from "react";
import { getConferenceByCode, getEventsByIds, getSpeakerById } from "@/lib/db";
import type { HTConference, HTEvent, HTPerson } from "@/types/db";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import PersonDetails from "./PersonDetails";
import { useNormalizedParams } from "@/lib/utils/params";

export function Person() {
  const { confCode, personId } = useNormalizedParams();

  const [person, setPerson] = useState<HTPerson | null>(null);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [events, setEvents] = useState<HTEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Page title management
  useEffect(() => {
    if (loading) {
      document.title = "Loading person | Hacker Tracker";
    } else if (conference && person) {
      document.title = `${person.name} · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "Person | Hacker Tracker";
    }
  }, [loading, conference, person]);

  useEffect(() => {
    if (!confCode) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [conf, p] = await Promise.all([
          getConferenceByCode(confCode),
          getSpeakerById(confCode, Number(personId)),
        ]);
        if (cancelled) return;

        let personEvents: HTEvent[] = [];

        if (p?.event_ids?.length) {
          personEvents = await getEventsByIds(confCode, p?.event_ids);
        }

        startTransition(() => {
          setConference(conf);
          setPerson(p);
          setEvents(personEvents);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load people";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [confCode, personId]);

  if (loading) return <LoadingPage message="Loading people..." />;

  if (!conference && error) {
    return <ErrorPage msg="People not found." />;
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {person && conference ? (
          <Suspense fallback={<LoadingPage message="Loading people..." />}>
            <PersonDetails
              conference={conference}
              person={person}
              events={events}
            />
          </Suspense>
        ) : null}
      </main>
      <HTFooter />
    </div>
  );
}
