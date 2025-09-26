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

  useEffect(() => {
    if (error) {
      document.title = "Error · Schedule | Hacker Tracker";
    } else if (loading) {
      document.title = "Loading schedule… | Hacker Tracker";
    } else if (conference) {
      document.title = `Schedule · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "Schedule | Hacker Tracker";
    }
  }, [loading, conference, error]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!confCode) return;
      setLoading(true);
      setError(null);
      setGrouped(null);
      setConference(null);

      try {
        const conf = await getConferenceByCode(confCode);
        if (cancelled) return;

        if (!conf) {
          setError(`Conference not found.`);
          return;
        }

        setConference(conf);

        const [evs, tags] = await Promise.all([
          getEvents(confCode),
          getTags(confCode),
        ]);
        if (cancelled) return;

        const tz = conf.timezone || "UTC";
        const groupedSchedule = buildScheduleBucketsByDay(
          evs as HTEvent[],
          tags as HTTagGroup[],
          tz
        );

        startTransition(() => {
          setGrouped(groupedSchedule);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load schedule";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [confCode]);

  if (loading) return <LoadingPage message="Loading schedule..." />;

  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="min-h-dvh flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {grouped && conference ? (
          <Suspense fallback={<LoadingPage message="Loading events..." />}>
            <EventsList
              dateGroup={grouped}
              conf={conference}
              pageTitle="Schedule"
            />
          </Suspense>
        ) : null}
      </main>
      <HTFooter />
    </div>
  );
}
