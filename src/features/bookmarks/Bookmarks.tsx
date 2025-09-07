import { useEffect, useState, lazy, Suspense, startTransition } from "react";
import { Link, useSearchParams } from "react-router";
import { getConferenceByCode, getEvents, getTags } from "@/lib/db";
import { buildScheduleBucketsByDay } from "@/lib/utils/schedule";
import type { GroupedSchedule } from "@/types/ht";
import type { HTConference, HTEvent, HTTagGroup } from "@/types/db";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import { loadConfBookmarks } from "@/lib/utils/storage";

const EventsList = lazy(() => import("../schedule/EventsList"));

export function Bookmarks() {
  const [searchParams] = useSearchParams();
  const confCode = searchParams.get("conf");

  const [grouped, setGrouped] = useState<GroupedSchedule | null>(null);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [loading, setLoading] = useState(false);
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
        return;
      }
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

        const bookmarks = loadConfBookmarks(confCode); // Set<number>
        if (bookmarks.size === 0) {
          setGrouped({});
          return;
        }

        const [evs, tags] = await Promise.all([
          getEvents(confCode),
          getTags(confCode),
        ]);
        if (cancelled) return;

        const tz = conf.timezone || "UTC";
        const bookmarkedEvents = (evs as HTEvent[]).filter((e) =>
          bookmarks.has(e.id)
        );
        const groupedSchedule = buildScheduleBucketsByDay(
          bookmarkedEvents,
          tags as HTTagGroup[],
          tz
        );

        startTransition(() => {
          setGrouped(groupedSchedule);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load bookmarks";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [confCode]);

  if (loading) return <LoadingPage message="Loading bookmarks..." />;

  if (error) return <ErrorPage msg={error} />;

  return (
    <div className="min-h-dvh flex flex-col">
      {conference && <ConferenceHeader conference={conference} />}
      <main className="flex-1">
        {confCode && grouped && Object.keys(grouped).length > 0 ? (
          <Suspense fallback={<LoadingPage message="Loading events..." />}>
            <EventsList
              dateGroup={grouped}
              confCode={confCode}
              pageTitle="Bookmarks"
            />
          </Suspense>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-400 mt-20">
            <p className="text-lg font-medium">No bookmarks found</p>
            {confCode && (
              <Link
                to={`/schedule?conf=${confCode}`}
                className="mt-3 inline-block rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:text-white transition"
              >
                Browse all events
              </Link>
            )}
          </div>
        )}
      </main>
      <HTFooter />
    </div>
  );
}
