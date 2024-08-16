"use client";

import Loading from "@/components/misc/Loading";
import { fetcher, toEventsData } from "@/lib/utils/misc";
import useSWR from "swr";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import Upcoming from "@/components/upcoming/Upcoming";
import React, { Suspense } from "react";

function UpcomingPageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");

  if (confCode === null) {
    return <Error msg="No conference code provided" />;
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

  const eventData = toEventsData(htEventsData, htTagsData ?? []);

  return (
    <>
      <title>{`${conf?.name} Upcoming`}</title>
      <meta name="description" content={`${conf?.name} Upcoming`} />

      <main>
        <Heading conf={conf} conferences={htIndexData} />
        <Upcoming conf={conf} events={eventData} tags={htTagsData ?? []} />
      </main>
    </>
  );
}

export default function UpcomingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpcomingPageContent />
    </Suspense>
  );
}
