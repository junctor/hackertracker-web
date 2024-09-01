"use client";

import Error from "@/components/misc/Error";
import { createDateGroup } from "@/lib/utils/dates";
import Events from "@/components/schedule/Events";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { useEffect, useState } from "react";
import firebaseInit from "../../fb/init";
import { getConferences, getEvents, getTags } from "../../fb/fb";
import { toEventsData } from "@/lib/utils/misc";
import Loading from "@/components/misc/Loading";

const SchedulePageContent = () => {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conf, setConf] = useState<HTConference | null>(null);
  const [confs, setConfs] = useState<HTConference[]>([]);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [htTags, setHtTags] = useState<HTTag[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (confCode === null) {
        setError("No conference code provided");
        setLoading(false);
        return;
      }

      try {
        const fbDb = await firebaseInit();
        const fetchedConfs = await getConferences(fbDb, 25);
        const foundConf = fetchedConfs.find((c) => c.code === confCode);

        if (foundConf === undefined) {
          setError("Conference not found");
          setLoading(false);
          return;
        }

        const [htEvents, htTags] = await Promise.all([
          getEvents(fbDb, foundConf.code),
          getTags(fbDb, foundConf.code),
        ]);

        const eventData = toEventsData(htEvents, htTags ?? []);

        setConf(foundConf);
        setConfs(fetchedConfs);
        setEventData(eventData);
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
      <meta name="description" content={`${conf?.name} Schedule`} />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Events
          dateGroup={createDateGroup(eventData)}
          conf={conf}
          tags={htTags}
        />
      </main>
    </>
  );
};

export default SchedulePageContent;
