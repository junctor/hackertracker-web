import { useEffect, useState, Suspense, startTransition } from "react";
import { useSearchParams } from "react-router";
import { getConferenceByCode, getSpeakers } from "@/lib/db";
import type { HTConference, HTPerson } from "@/types/db";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import PeopleList from "../people/PeopleList";

export function People() {
  const [searchParams] = useSearchParams();
  const confCode = searchParams.get("conf");

  const [people, setPeople] = useState<HTPerson[]>([]);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Page title management
  useEffect(() => {
    if (loading) {
      document.title = "Loading people | Hacker Tracker";
    } else if (conference) {
      document.title = `People · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "People | Hacker Tracker";
    }
  }, [loading, conference]);

  useEffect(() => {
    if (!confCode) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [conf, ppl] = await Promise.all([
          getConferenceByCode(confCode),
          getSpeakers(confCode),
        ]);
        if (cancelled) return;

        startTransition(() => {
          setConference(conf);
          setPeople(ppl);
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
  }, [confCode]);

  if (loading) return <LoadingPage message="Loading people..." />;

  if (!conference && error) {
    return <ErrorPage msg="People not found." />;
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {people.length && confCode ? (
          <Suspense fallback={<LoadingPage message="Loading people..." />}>
            <PeopleList confCode={confCode} people={people} />
          </Suspense>
        ) : null}
      </main>
      <HTFooter />
    </div>
  );
}
