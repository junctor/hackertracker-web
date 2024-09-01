"use client";

import Loading from "@/components/misc/Loading";
import { toEventsData } from "@/lib/utils/misc";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import Upcoming from "@/components/upcoming/Upcoming";
import React, { Suspense } from "react";
import firebaseInit from "@/fb/init";
import {
  getConferences,
  getOnNowEvents,
  getTags,
  getUpcomingEvents,
} from "@/fb/fb";

async function UpcomingPageContent() {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");

  if (confCode === null) {
    return <Error msg="No conference code provided" />;
  }

  const fbDb = await firebaseInit();
  const confs = await getConferences(fbDb, 25);
  const conf = confs.find((c) => c.code === confCode);

  if (conf === undefined) {
    return <Error msg="Conference not found" />;
  }

  const [htOnNowEvents, htUpcomingEvents, htTags] = await Promise.all([
    getOnNowEvents(fbDb, conf.code),
    getUpcomingEvents(fbDb, conf.code),
    getTags(fbDb, conf.code),
  ]);

  const onNowEventData = toEventsData(htOnNowEvents, htTags ?? []);

  const upcomingEventData = toEventsData(htUpcomingEvents, htTags ?? []);

  return (
    <>
      <title>{`${conf?.name} Upcoming`}</title>
      <meta name="description" content={`${conf?.name} Upcoming`} />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Upcoming
          conf={conf}
          onNowEvents={onNowEventData}
          upcomingEvents={upcomingEventData}
          tags={htTags ?? []}
        />
      </main>
    </>
  );
}

export default function UpcomingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UpcomingPageContent />
    </Suspense>
  );
}
