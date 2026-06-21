import { useEffect, useState, Suspense, startTransition } from "react";

import type { HTConference, HTPerson } from "@/types/db";
import type { ProcessedScheduledContent } from "@/types/ht";

import { ConferenceHeader } from "@/components/ConferenceHeader";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import LoadingPage from "@/components/LoadingPage";
import { getConferenceByCode, getContentByIds, getSpeakerById, getTags } from "@/lib/db";
import { useNormalizedParams } from "@/lib/utils/params";
import { processScheduleData } from "@/lib/utils/schedule";

import PersonDetails from "./PersonDetails";

export function Person() {
  const { confCode, personId } = useNormalizedParams();

  const [person, setPerson] = useState<HTPerson | null>(null);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [scheduledContents, setScheduledContents] = useState<ProcessedScheduledContent[]>([]);
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
      setScheduledContents([]);

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

        let personScheduledContents: ProcessedScheduledContent[] = [];
        if (p.content_ids?.length) {
          const [content, tags] = await Promise.all([
            getContentByIds(confCode, p.content_ids),
            getTags(confCode),
          ]);
          if (cancelled) return;
          personScheduledContents = processScheduleData(content, tags, [p]);
        }

        startTransition(() => {
          setPerson(p);
          setScheduledContents(personScheduledContents);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load person";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [confCode, personId]);

  if (loading) return <LoadingPage message="Loading person..." />;
  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="ui-page flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {person && conference ? (
          <Suspense fallback={<LoadingPage message="Loading person..." />}>
            <PersonDetails
              conference={conference}
              person={person}
              scheduledContents={scheduledContents}
            />
          </Suspense>
        ) : null}
      </main>
      <HTFooter />
    </div>
  );
}
