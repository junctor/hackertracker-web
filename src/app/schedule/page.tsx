"use client";

import Loading from "@/components/misc/Loading";
import { fetcher, toEventsData } from "@/lib/utils/misc";
import useSWR from "swr";
import Error from "@/components/misc/Error";
import { createDateGroup } from "@/lib/utils/dates";
import Events from "@/components/schedule/Events";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";

function SchedulePageContent() {
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
      <title>{conf?.name}</title>
      <meta name="description" content={`${conf?.name} Schedule`} />

      <main>
        <Heading conf={conf} conferences={htIndexData} />
        <Events
          dateGroup={createDateGroup(eventData)}
          conf={conf}
          tags={htTagsData ?? []}
        />
      </main>
    </>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SchedulePageContent />
    </Suspense>
  );
}
