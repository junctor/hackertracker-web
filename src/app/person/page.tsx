"use client";

import Loading from "@/components/misc/Loading";

import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";
import Person from "@/components/people/person";
import firebaseInit from "@/fb/init";
import { getConferences, getEvents, getSpeakerById } from "@/fb/fb";

async function PersonPageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");
  const personId = searchParams.get("person");

  if (confCode === null || personId === null) {
    return <Error msg="No conference or person code provided" />;
  }
  const fbDb = await firebaseInit();
  const confs = await getConferences(fbDb, 25);
  const conf = confs.find((c) => c.code === confCode);

  if (conf === undefined) {
    return <Error msg="Conference not found" />;
  }

  const person = await getSpeakerById(fbDb, conf.code, personId);

  if (person === null) {
    return <Error msg="No person found for id" />;
  }

  const htEvents = await getEvents(fbDb, conf.code);

  return (
    <>
      <title>{`${person.name} | ${conf.name}`}</title>
      <meta name="description" content={`${person.name} | ${conf.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Person person={person} conf={conf} events={htEvents} />
      </main>
    </>
  );
}

export default function PersonPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PersonPageContent />
    </Suspense>
  );
}
