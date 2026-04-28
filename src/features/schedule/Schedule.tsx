import { useEffect, useState, lazy, Suspense, useTransition } from "react";

import type { HTConference, HTEvent, HTTagGroup } from "@/types/db";
import type { GroupedSchedule } from "@/types/ht";

import { ConferenceHeader } from "@/components/ConferenceHeader";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import LoadingPage from "@/components/LoadingPage";
import { getConferenceByCode, getEvents, getTags } from "@/lib/db";
import { useNormalizedParams } from "@/lib/utils/params";
import { buildScheduleBucketsByDay } from "@/lib/utils/schedule";

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

  const [grouped, setGrouped] = useState<GroupedSchedule | null>(null);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void preloadEventsList();
  }, [confCode]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (error) document.title = "Error · Schedule | Hacker Tracker";
      else if (isPending && !grouped) document.title = "Loading schedule… | Hacker Tracker";
      else if (conference) document.title = `Schedule · ${conference.name} | Hacker Tracker`;
      else document.title = "Schedule | Hacker Tracker";
    }, 150); // small debounce
    return () => clearTimeout(id);
  }, [conference, grouped, error, isPending]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!confCode) return;
      setError(null);

      try {
        const conf = await getConferenceByCode(confCode);
        if (cancelled) return;

        if (!conf) {
          setError("Conference not found.");
          return;
        }

        const preload = preloadEventsList();

        const [evs, tags] = await Promise.all([getEvents(confCode), getTags(confCode), preload]);
        if (cancelled) return;

        const tz = conf.timezone || "UTC";
        const groupedSchedule = buildScheduleBucketsByDay(
          evs as HTEvent[],
          tags as HTTagGroup[],
          tz,
        );

        startTransition(() => {
          if (!cancelled) {
            setConference(conf);
            setGrouped(groupedSchedule);
          }
        });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load schedule";
          setError(msg);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [confCode]);

  if (!grouped && !conference && !error && isPending) {
    return <LoadingPage message="Loading schedule..." />;
  }
  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="flex min-h-dvh flex-col">
      {conference && <ConferenceHeader conference={conference} />}

      <main className="relative flex-1">
        {isPending && (
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

      <HTFooter />
    </div>
  );
}
