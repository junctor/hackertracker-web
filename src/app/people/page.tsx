"use client";

import Loading from "@/components/misc/Loading";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";
import People from "@/components/people/people";
import firebaseInit from "@/fb/init";
import { getConferences, getSpeakers } from "@/fb/fb";

async function PeoplePageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");

  if (confCode === null) {
    return <Error msg="No conference provided" />;
  }

  const fbDb = await firebaseInit();
  const confs = await getConferences(fbDb, 25);
  const conf = confs.find((c) => c.code === confCode);

  if (conf === undefined) {
    return <Error msg="Conference not found" />;
  }

  const htSpeakers = await getSpeakers(fbDb, conf.code);

  return (
    <Suspense fallback={<Loading />}>
      <title>{`Speakers | ${conf.name}`}</title>
      <meta name="description" content={`Speakers | ${conf.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={confs} />
        <People people={htSpeakers} conf={conf} />
      </main>
    </Suspense>
  );
}

export default function PeoplePage() {
  return (
    <Suspense fallback={<Loading />}>
      <PeoplePageContent />
    </Suspense>
  );
}
