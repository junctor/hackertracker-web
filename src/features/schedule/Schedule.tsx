import { useEffect, useState, lazy, Suspense, startTransition } from "react";
import { getConferenceByCode, getEvents, getTags } from "@/lib/db";
import { buildScheduleBucketsByDay } from "@/lib/utils/schedule";
import type { GroupedSchedule } from "@/types/ht";
import type { HTConference, HTEvent, HTTagGroup } from "@/types/db";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import { useNormalizedParams } from "@/lib/utils/params";

const EventsList = lazy(() => import("./EventsList"));

export function Schedule() {
  const { confCode } = useNormalizedParams();

  const [grouped, setGrouped] = useState<GroupedSchedule | null>(null);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Page title management
  useEffect(() => {
    if (loading) {
      document.title = "Loading schedule… | Hacker Tracker";
    } else if (conference) {
      document.title = `Schedule · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "Schedule | Hacker Tracker";
    }
  }, [loading, conference]);

  useEffect(() => {
    if (!confCode) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [conf, evs, tags] = await Promise.all([
          getConferenceByCode(confCode),
          getEvents(confCode),
          getTags(confCode),
        ]);
        if (cancelled) return;

        startTransition(() => {
          setConference(conf);
          const tz = conf?.timezone || "UTC";
          const groupedSchedule = buildScheduleBucketsByDay(
            evs as HTEvent[],
            tags as HTTagGroup[],
            tz
          );
          setGrouped(groupedSchedule);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load schedule";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [confCode]);

  if (loading) return <LoadingPage message="Loading schedule..." />;

  if (!conference && error) {
    return <ErrorPage msg="Conference not found." />;
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {grouped && confCode ? (
          <Suspense fallback={<LoadingPage message="Loading events..." />}>
            <EventsList
              dateGroup={grouped}
              confCode={confCode}
              pageTitle="Schedule"
            />
          </Suspense>
        ) : null}
      </main>
      <HTFooter />
    </div>
  );
}
