"use client";

import { fetcher, sortConferences } from "@/lib/utils/misc";
import useSWR from "swr";
import { redirect } from "next/navigation";
import Loading from "@/components/misc/Loading";
import Error from "@/components/misc/Error";

export default function Home() {
  const {
    data: htData,
    error: htError,
    isLoading: htIsLoading,
  } = useSWR<HTConference[], Error>("ht/index.json", fetcher);

  if (htIsLoading) {
    return <Loading />;
  }

  if (htData === undefined || htError !== undefined) {
    return <Error msg={htError?.message} />;
  }

  const conf = sortConferences(htData)[0].code;

  return redirect(`/conferences/${conf}/schedule`);
}
