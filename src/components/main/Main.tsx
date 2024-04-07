"use client";

import Head from "next/head";
import Schedule from "../schedule/Schedule";
import Heading from "../heading/Heading";
import useSWR from "swr";
import Loading from "../misc/Loading";
import Error from "@/components/misc/Error";
import { displayConference, fetcher } from "../../lib/utils/misc";

export default function Main({ conf }: { conf: string }) {
  const {
    data: htData,
    error,
    isLoading,
  } = useSWR<HTConference[], Error>("../../../ht/index.json", fetcher);

  if (isLoading) {
    return <Loading />;
  }

  if (htData === undefined || error !== undefined) {
    return <Error msg={error?.message} />;
  }

  const selectedConf = displayConference(conf, htData);

  return (
    <div>
      <Head>
        <title>{`HackerTracker / ${selectedConf.name}`}</title>
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
          <Schedule conf={selectedConf} />
        </div>
      </main>
    </div>
  );
}
