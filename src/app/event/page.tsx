"use client";

import Loading from "@/components/misc/Loading";
import { fetcher } from "@/lib/utils/misc";
import useSWR from "swr";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Event from "@/components/event/Event";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";

function EventPageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");
  const eventId = searchParams.get("event");

  if (confCode === null || eventId === null) {
    return <Error msg="No conference or event code provided" />;
  }

  const {
    data: htIndexData,
    error: htIndexError,
    isLoading: htIndexIsLoading,
  } = useSWR<HTConference[], Error>(`../../../ht/index.json`, fetcher);

  const {
    data: htEventsData,
    error: htEventsError,
    isLoading: htEventsIsLoading,
  } = useSWR<HTEvent[], Error>(
    `../../../ht/conferences/${confCode.toUpperCase()}/events.json`,
    fetcher
  );

  const { data: htTagsData, isLoading: htTagsIsLoading } = useSWR<
    HTTag[],
    Error
  >(`../../../ht/conferences/${confCode.toUpperCase()}/tags.json`, fetcher);

  if (htEventsIsLoading || htIndexIsLoading || htTagsIsLoading) {
    return <Loading />;
  }

  if (htEventsIsLoading || htIndexIsLoading) {
    return <Loading />;
  }

  if (
    htEventsError !== undefined ||
    htIndexError !== undefined ||
    htEventsData === undefined ||
    htIndexData === undefined
  ) {
    return <Error />;
  }

  const conf = htIndexData.find((c) => c.code === confCode);

  if (conf === undefined) {
    return <Error msg="Conference not found" />;
  }

  const event = htEventsData?.find(
    (e) => e.id.toString().toLowerCase() === eventId.toLowerCase()
  );

  if (event === undefined) {
    return <Error msg="No event found for id" />;
  }

  return (
    <>
      <title>{`${event.title} | ${conf.name}`}</title>
      <meta name="description" content={`${event.title} | ${conf.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={htIndexData} />
        <Event conf={conf} event={event} tags={htTagsData ?? []} />
      </main>
    </>
  );
}

export default function EventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventPageContent />
    </Suspense>
  );
}
