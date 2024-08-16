"use client";

import Loading from "@/components/misc/Loading";
import { fetcher } from "@/lib/utils/misc";
import useSWR from "swr";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";
import People from "@/components/people/people";

function PeoplePageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");

  if (confCode === null) {
    return <Error msg="No conference provided" />;
  }

  const {
    data: htIndexData,
    error: htIndexError,
    isLoading: htIndexIsLoading,
  } = useSWR<HTConference[], Error>(`../../../ht/index.json`, fetcher);

  const {
    data: htSpeakersData,
    error: htSpeakersError,
    isLoading: htSpeakersIsLoading,
  } = useSWR<HTSpeaker[], Error>(
    `../../../ht/conferences/${confCode.toUpperCase()}/speakers.json`,
    fetcher
  );

  if (htSpeakersIsLoading || htIndexIsLoading) {
    return <Loading />;
  }

  if (
    htSpeakersError !== undefined ||
    htIndexError !== undefined ||
    htSpeakersData === undefined ||
    htIndexData === undefined
  ) {
    return <Error />;
  }

  const conf = htIndexData.find((c) => c.code === confCode);

  if (conf === undefined) {
    return <Error msg="Conference not found" />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <title>{`Speakers | ${conf.name}`}</title>
      <meta name="description" content={`Speakers | ${conf.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={htIndexData} />
        <People people={htSpeakersData} conf={conf} />
      </main>
    </Suspense>
  );
}

export default function PeoplePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PeoplePageContent />
    </Suspense>
  );
}
