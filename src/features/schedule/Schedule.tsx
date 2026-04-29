import { useEffect, useState, lazy, Suspense, useTransition } from "react";

import type { HTConference } from "@/types/db";
import type { GroupedSchedule } from "@/types/ht";

import { ConferenceHeader } from "@/components/ConferenceHeader";
import ErrorPage from "@/components/ErrorPage";
import LoadingPage from "@/components/LoadingPage";
import { getCachedConferenceSchedule, getConferenceSchedule } from "@/lib/db";
import { useNormalizedParams } from "@/lib/utils/params";

const EventsList = lazy(() => import("./EventsList"));
let eventsListPreload: Promise<unknown> | null = null;
function preloadEventsList() {
  if (!eventsListPreload) {
    eventsListPreload = import("./EventsList");
  }
  return eventsListPreload;
}

export function Schedule() {
  const { confCode } = useNormalizedParams();
  const [initialSchedule] = useState(() =>
    confCode ? getCachedConferenceSchedule(confCode) : null,
  );

  const [grouped, setGrouped] = useState<GroupedSchedule | null>(initialSchedule?.grouped ?? null);
  const [conference, setConference] = useState<HTConference | null>(
    initialSchedule?.conference ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialSchedule);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void preloadEventsList();
  }, [confCode]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (error) document.title = "Error · Schedule | Hacker Tracker";
      else if (loading && !grouped) document.title = "Loading schedule… | Hacker Tracker";
      else if (conference) document.title = `Schedule · ${conference.name} | Hacker Tracker`;
      else document.title = "Schedule | Hacker Tracker";
    }, 150); // small debounce
    return () => clearTimeout(id);
  }, [conference, grouped, error, loading]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!confCode) {
        setError("Missing required URL parameters.");
        setLoading(false);
        return;
      }
      setError(null);

      const cachedSchedule = getCachedConferenceSchedule(confCode);
      if (cachedSchedule) {
        setConference(cachedSchedule.conference);
        setGrouped(cachedSchedule.grouped);
        setLoading(false);
      } else {
        setConference(null);
        setGrouped(null);
        setLoading(true);
      }

      try {
        const schedule = await getConferenceSchedule(confCode);
        if (cancelled) return;

        if (!schedule) {
          setError("Conference not found.");
          return;
        }

        await preloadEventsList();
        if (cancelled) return;

        startTransition(() => {
          if (!cancelled) {
            setConference(schedule.conference);
            setGrouped(schedule.grouped);
          }
        });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load schedule";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [confCode]);

  if (!grouped && !conference && !error && loading) {
    return <LoadingPage message="Loading schedule..." />;
  }
  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="flex min-h-dvh flex-col">
      {conference && <ConferenceHeader conference={conference} />}

      <main className="relative flex-1">
        {(loading || isPending) && grouped && (
          <div className="bg-background/40 pointer-events-none absolute inset-0 backdrop-blur-[1px] transition-opacity" />
        )}

        {grouped && conference ? (
          <Suspense fallback={null}>
            <EventsList dateGroup={grouped} conf={conference} pageTitle="Schedule" />
          </Suspense>
        ) : (
          <LoadingPage message="Loading events..." />
        )}
      </main>
    </div>
  );
}
