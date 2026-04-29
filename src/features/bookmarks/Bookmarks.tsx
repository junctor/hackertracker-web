import { useEffect, useState, lazy, Suspense, startTransition } from "react";
import { Link, useSearchParams } from "react-router";

import type { HTConference } from "@/types/db";
import type { GroupedSchedule } from "@/types/ht";

import { ConferenceHeader } from "@/components/ConferenceHeader";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import LoadingPage from "@/components/LoadingPage";
import {
  filterScheduleByEventIds,
  getCachedConferenceSchedule,
  getConferenceSchedule,
} from "@/lib/db";
import { loadConfBookmarks } from "@/lib/utils/storage";

const EventsList = lazy(() => import("../schedule/EventsList"));

export function Bookmarks() {
  const [searchParams] = useSearchParams();
  const confCode = searchParams.get("conf")?.trim().toUpperCase() ?? null;
  const [initial] = useState(() => {
    if (!confCode) return null;
    const schedule = getCachedConferenceSchedule(confCode);
    if (!schedule) return null;
    return {
      conference: schedule.conference,
      grouped: filterScheduleByEventIds(schedule.grouped, loadConfBookmarks(confCode)),
    };
  });

  const [grouped, setGrouped] = useState<GroupedSchedule | null>(initial?.grouped ?? null);
  const [conference, setConference] = useState<HTConference | null>(initial?.conference ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      document.title = "Error · Bookmarks | Hacker Tracker";
    } else if (loading) {
      document.title = "Loading bookmarks… | Hacker Tracker";
    } else if (conference) {
      document.title = `Bookmarks · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "Bookmarks | Hacker Tracker";
    }
  }, [loading, conference, error]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!confCode) {
        setError("Missing required URL parameters.");
        setLoading(false);
        return;
      }
      setError(null);

      const cachedSchedule = getCachedConferenceSchedule(confCode);
      const bookmarks = loadConfBookmarks(confCode);
      if (cachedSchedule) {
        setConference(cachedSchedule.conference);
        setGrouped(filterScheduleByEventIds(cachedSchedule.grouped, bookmarks));
        setLoading(false);
      } else {
        setLoading(true);
        setGrouped(null);
        setConference(null);
      }

      try {
        const schedule = await getConferenceSchedule(confCode);
        if (cancelled) return;
        if (!schedule) {
          setError(`Conference not found.`);
          return;
        }

        if (bookmarks.size === 0) {
          setConference(schedule.conference);
          setGrouped({});
          return;
        }

        const groupedSchedule = filterScheduleByEventIds(schedule.grouped, bookmarks);

        startTransition(() => {
          setConference(schedule.conference);
          setGrouped(groupedSchedule);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load bookmarks";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [confCode]);

  if (loading && !grouped && !conference) return <LoadingPage message="Loading bookmarks..." />;

  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="flex min-h-dvh flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {conference && grouped && Object.keys(grouped).length > 0 ? (
          <Suspense fallback={<LoadingPage message="Loading events..." />}>
            <EventsList dateGroup={grouped} conf={conference} pageTitle="Bookmarks" />
          </Suspense>
        ) : (
          <div className="ui-empty-state mx-auto mt-20 max-w-md">
            <p className="text-gray-200">No bookmarks found.</p>
            {confCode && (
              <Link
                to={`/schedule?conf=${confCode}`}
                className="ui-btn-base ui-btn-secondary ui-focus-ring ui-empty-state-action focus-visible:outline-none"
              >
                Browse Schedule
              </Link>
            )}
          </div>
        )}
      </main>
      <HTFooter />
    </div>
  );
}
