"use client";

import Head from "next/head";
import Schedule from "../events/Schedule";
import Heading from "../heading/Heading";
import useSWR from "swr";
import Loading from "../misc/Loading";
import Error from "@/components/misc/Error";
import { fetcher } from "../../lib/utils/misc";
import { useSearchParams } from "next/navigation";

export default function Main() {
  const searchParams = useSearchParams();

  const {
    data: htData,
    error,
    isLoading,
  } = useSWR<HTConference[], Error>("/ht/index.json", fetcher);

  if (isLoading) {
    return <Loading />;
  }

  if (htData === undefined || error !== undefined) {
    return <Error />;
  }

  const confId = searchParams.get("c");

  const conf =
    htData?.find(
      (c) => c.code.toString().toLowerCase() === confId?.toLowerCase()
    ) ?? htData[0];

  return (
    <div>
      <Head>
        <title>HackerTracker</title>
        <meta name="description" content="HackerTracker" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>
          <Heading conferences={htData} />
          <Schedule conf={conf} />
        </div>
      </main>
    </div>
  );
}
