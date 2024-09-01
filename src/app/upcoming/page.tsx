"use client";

import Loading from "@/components/misc/Loading";
import { toEventsData } from "@/lib/utils/misc";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import Upcoming from "@/components/upcoming/Upcoming";
import React, { useEffect, useState } from "react";
import firebaseInit from "@/fb/init";
import {
  getConferences,
  getOnNowEvents,
  getTags,
  getUpcomingEvents,
} from "@/fb/fb";

const UpcomingPageContent = () => {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conf, setConf] = useState<HTConference | null>(null);
  const [confs, setConfs] = useState<HTConference[]>([]);
  const [htTags, setHtTags] = useState<HTTag[]>([]);
  const [onNowEventData, setOnNowEventData] = useState<EventData[]>([]);
  const [upcomingEventData, setUpcomingEventData] = useState<EventData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (confCode === null) {
        setError("No conference code provided");
        setLoading(false);
        return;
      }

      try {
        const fbDb = await firebaseInit();
        const confs = await getConferences(fbDb, 25);
        const foundConf = confs.find((c) => c.code === confCode);

        if (foundConf === undefined) {
          setError("Conference not found");
          setLoading(false);
          return;
        }

        const [htOnNowEvents, htUpcomingEvents, htTags] = await Promise.all([
          getOnNowEvents(fbDb, foundConf.code),
          getUpcomingEvents(fbDb, foundConf.code),
          getTags(fbDb, foundConf.code),
        ]);

        const onNowEventData = toEventsData(htOnNowEvents, htTags ?? []);
        const upcomingEventData = toEventsData(htUpcomingEvents, htTags ?? []);

        setConf(foundConf);
        setOnNowEventData(onNowEventData);
        setUpcomingEventData(upcomingEventData);
        setConfs(confs);
        setHtTags(htTags ?? []);
      } catch {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [confCode]);

  if (loading) {
    return <Loading />;
  }

  if (error !== null) {
    return <Error msg={error} />;
  }

  if (conf === null) {
    return <Error msg="Conference not found" />;
  }

  return (
    <>
      <title>{conf?.name}</title>
      <meta name="description" content={`${conf?.name} Upcoming Events`} />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Upcoming
          conf={conf}
          onNowEvents={onNowEventData}
          upcomingEvents={upcomingEventData}
          tags={htTags}
        />
      </main>
    </>
  );
};

export default function UpcomingPage() {
  return (
    <React.Suspense fallback={<Loading />}>
      <UpcomingPageContent />
    </React.Suspense>
  );
}
