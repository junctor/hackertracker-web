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

  useEffect(() => {
    if (error) {
      document.title = "Error · Person | Hacker Tracker";
    } else if (loading) {
      document.title = "Loading person… | Hacker Tracker";
    } else if (conference && person) {
      document.title = `${person.name} · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "Person | Hacker Tracker";
    }
  }, [loading, conference, person, error]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!confCode || !personId) {
        setError("Missing required URL parameters.");
        return;
      }
      setLoading(true);
      setError(null);
      setPerson(null);
      setConference(null);
      setEvents([]);

      try {
        const conf = await getConferenceByCode(confCode);
        if (cancelled) return;
        if (!conf) {
          setError(`Conference not found.`);
          return;
        }
        setConference(conf);

        const p = await getSpeakerById(confCode, Number(personId));
        if (cancelled) return;
        if (!p) {
          setError("Person not found.");
          return;
        }

        let personEvents: HTEvent[] = [];
        if (p.event_ids?.length) {
          personEvents = await getEventsByIds(confCode, p.event_ids);
          if (cancelled) return;
        }

        startTransition(() => {
          setPerson(p);
          setEvents(personEvents);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load person";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [confCode, personId]);

  if (loading) return <LoadingPage message="Loading person..." />;
  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="min-h-dvh flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {person && conference ? (
          <Suspense fallback={<LoadingPage message="Loading person..." />}>
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
