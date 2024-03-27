"use client";

import useSWR from "swr";
import { fetcher, toEventsData } from "../../lib/utils/misc";
import Loading from "@/components/misc/Loading";
import Error from "@/components/misc/Error";
import { createDateGroup } from "@/lib/utils/dates";
import Events from "./Events";

export default function Schedule({ conf }: { conf: HTConference }) {
  const {
    data: htData,
    error,
    isLoading,
  } = useSWR<HTEvent[], Error>(
    `/ht/conferences/${conf.code}/events.json`,
    fetcher
  );

  if (isLoading) {
    return <Loading />;
  }

  if (htData === undefined || error !== undefined) {
    return <Error />;
  }

  const eventData = toEventsData(htData);

  return (
    <main>
      <Events dateGroup={createDateGroup(eventData)} conf={conf} />
    </main>
  );
}
