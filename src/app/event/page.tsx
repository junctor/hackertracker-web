"use client";

import Loading from "@/components/misc/Loading";

import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Event from "@/components/event/Event";
import Heading from "@/components/heading/Heading";
import React, { useEffect, useState } from "react";
import firebaseInit from "@/fb/init";
import { getConferences, getEventById, getTags } from "@/fb/fb";

const EventPageContent = () => {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");
  const eventId = searchParams.get("event");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conf, setConf] = useState<HTConference | null>(null);
  const [event, setEvent] = useState<HTEvent | null>(null);
  const [htTags, setHtTags] = useState<HTTag[]>([]);
  const [confs, setConfs] = useState<HTConference[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (confCode === null || eventId === null) {
        setError("No conference or event code provided");
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

        const foundEvent = await getEventById(fbDb, foundConf.code, eventId);

        if (foundEvent === null) {
          setError("No event found for id");
          setLoading(false);
          return;
        }

        const tags = await getTags(fbDb, foundConf.code);

        setConf(foundConf);
        setEvent(foundEvent);
        setHtTags(tags ?? []);
        setConfs(confs);
      } catch {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [confCode, eventId]);

  if (loading) {
    return <Loading />;
  }

  if (error !== null) {
    return <Error msg={error} />;
  }

  if (conf === null) {
    return <Error msg="Conference not found" />;
  }

  if (event === null) {
    return <Error msg="Event not found" />;
  }

  return (
    <>
      <title>{`${event?.title} | ${conf?.name}`}</title>
      <meta name="description" content={`${event?.title} | ${conf?.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Event conf={conf} event={event} tags={htTags ?? []} />
      </main>
    </>
  );
};

export default EventPageContent;
