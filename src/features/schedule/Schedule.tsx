import { useEffect, useState, lazy, Suspense, useTransition } from "react";
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
    preloadEventsList();
  }, [confCode]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (error) document.title = "Error · Schedule | Hacker Tracker";
      else if (isPending && !grouped)
        document.title = "Loading schedule… | Hacker Tracker";
      else if (conference)
        document.title = `Schedule · ${conference.name} | Hacker Tracker`;
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

        const [evs, tags] = await Promise.all([
          getEvents(confCode),
          getTags(confCode),
          preload,
        ]);
        if (cancelled) return;

        const tz = conf.timezone || "UTC";
        const groupedSchedule = buildScheduleBucketsByDay(
          evs as HTEvent[],
          tags as HTTagGroup[],
          tz
        );

        startTransition(() => {
          if (!cancelled) {
            setConference(conf);
            setGrouped(groupedSchedule);
          }
        });
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error ? e.message : "Failed to load schedule";
          setError(msg);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [confCode]);

  if (!grouped && !conference && !error && isPending) {
    return <LoadingPage message="Loading schedule..." />;
  }
  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="min-h-dvh flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}

      <main className="flex-1 relative">
        {isPending && (
          <div className="pointer-events-none absolute inset-0 bg-background/40 backdrop-blur-[1px] transition-opacity" />
        )}

        {grouped && conference ? (
          <Suspense fallback={null}>
            <EventsList
              dateGroup={grouped}
              conf={conference}
              pageTitle="Schedule"
            />
          </Suspense>
        ) : (
          <LoadingPage message="Loading events..." />
        )}
      </main>

      <HTFooter />
    </div>
  );
}
