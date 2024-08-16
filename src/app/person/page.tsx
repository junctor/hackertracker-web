"use client";

import Loading from "@/components/misc/Loading";
import { fetcher } from "@/lib/utils/misc";
import useSWR from "swr";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";
import Person from "@/components/people/person";

function PersonPageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");
  const personId = searchParams.get("person");

  if (confCode === null || personId === null) {
    return <Error msg="No conference or person code provided" />;
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

  const {
    data: htSpeakersData,
    error: htSpeakersError,
    isLoading: htSpeakersIsLoading,
  } = useSWR<HTSpeaker[], Error>(
    `../../../ht/conferences/${confCode.toUpperCase()}/speakers.json`,
    fetcher
  );

  if (htSpeakersIsLoading || htIndexIsLoading || htEventsIsLoading) {
    return <Loading />;
  }

  if (
    htSpeakersError !== undefined ||
    htIndexError !== undefined ||
    htSpeakersData === undefined ||
    htIndexData === undefined ||
    htEventsData == undefined ||
    htEventsError !== undefined
  ) {
    return <Error />;
  }

  const conf = htIndexData.find((c) => c.code === confCode);

  if (conf === undefined) {
    return <Error msg="Conference not found" />;
  }

  const person = htSpeakersData?.find(
    (s) => s.id.toString().toLowerCase() === personId.toLowerCase()
  );

  if (person === undefined) {
    return <Error msg="No person found for id" />;
  }

  return (
    <>
      <title>{`${person.name} | ${conf.name}`}</title>
      <meta name="description" content={`${person.name} | ${conf.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={htIndexData} />
        <Person person={person} conf={conf} events={htEventsData} />
      </main>
    </>
  );
}

export default function PersonPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PersonPageContent />
    </Suspense>
  );
}
