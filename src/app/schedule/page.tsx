"use client";

import Error from "@/components/misc/Error";
import { createDateGroup } from "@/lib/utils/dates";
import Events from "@/components/schedule/Events";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { Suspense } from "react";
import firebaseInit from "../../fb/init";
import { getConferences, getEvents, getTags } from "../../fb/fb";
import { toEventsData } from "@/lib/utils/misc";
import Loading from "@/components/misc/Loading";

async function SchedulePageContent() {
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

  const [htEvents, htTags] = await Promise.all([
    getEvents(fbDb, conf.code),
    getTags(fbDb, conf.code),
  ]);

  const eventData = toEventsData(htEvents, htTags ?? []);

  return (
    <>
      <title>{conf?.name}</title>
      <meta name="description" content={`${conf?.name} Schedule`} />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Events
          dateGroup={createDateGroup(eventData)}
          conf={conf}
          tags={htTags ?? []}
        />
      </main>
    </>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<Loading />}>
      <SchedulePageContent />
    </Suspense>
  );
}
