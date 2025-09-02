import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getConferenceById, getEvents, getTags } from "@/lib/db";
import { buildScheduleBucketsByDay } from "@/lib/utils/schedule";
import type { GroupedSchedule } from "@/types/ht";
import type { HTConference, HTEvent, HTTagGroup } from "@/types/db";
import EventsList from "./EventsList";
import { ConferenceHeader } from "@/components/ConferenceHeader";
import LoadingPage from "@/components/LoadingPage";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";

export function Schedule() {
  const [searchParams] = useSearchParams();
  const confCode = searchParams.get("conf");

  const [grouped, setGrouped] = useState<GroupedSchedule | null>(null);
  const [conference, setConference] = useState<HTConference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!confCode) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [conf, evs, tags] = await Promise.all([
          getConferenceById(confCode),
          getEvents(confCode),
          getTags(confCode),
        ]);

        if (cancelled) return;

        setConference(conf);

        const tz = conf?.timezone || "UTC";
        const groupedSchedule = buildScheduleBucketsByDay(
          evs as HTEvent[],
          tags as HTTagGroup[],
          tz
        );

        setGrouped(groupedSchedule);
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

  if (loading) return <LoadingPage />;

  if (!loading && !conference && error && conference === null) {
    return <ErrorPage msg="Conference not found." />;
  }

  return (
    <>
      {conference && <ConferenceHeader conference={conference} />}
      {grouped && confCode && (
        <EventsList dateGroup={grouped} confCode={confCode} />
      )}
      <HTFooter />
    </>
  );
}
