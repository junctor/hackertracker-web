"use client";

import Loading from "@/components/misc/Loading";

import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Event from "@/components/event/Event";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";
import firebaseInit from "@/fb/init";
import { getConferences, getEventById, getTags } from "@/fb/fb";

async function EventPageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");
  const eventId = searchParams.get("event");

  if (confCode === null || eventId === null) {
    return <Error msg="No conference or event code provided" />;
  }

  const fbDb = await firebaseInit();
  const confs = await getConferences(fbDb, 25);
  const conf = confs.find((c) => c.code === confCode);

  if (conf === undefined) {
    return <Error msg="Conference not found" />;
  }

  const event = await getEventById(fbDb, conf.code, eventId);

  if (event === null) {
    return <Error msg="No event found for id" />;
  }

  const htTags = await getTags(fbDb, conf.code);

  return (
    <>
      <title>{`${event.title} | ${conf.name}`}</title>
      <meta name="description" content={`${event.title} | ${conf.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Event conf={conf} event={event} tags={htTags ?? []} />
      </main>
    </>
  );
}

export default function EventPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EventPageContent />
    </Suspense>
  );
}
