"use client";

import Head from "next/head";
import Schedule from "../schedule/Schedule";
import Heading from "../heading/Heading";
import useSWR from "swr";
import Loading from "../misc/Loading";
import Error from "@/components/misc/Error";
import { displayConference, fetcher } from "../../lib/utils/misc";
import Event from "@/components/event/Event";

export default function Main({
  conf,
  content,
}: {
  conf: string;
  content: string;
}) {
  const {
    data: htConferences,
    error,
    isLoading,
  } = useSWR<HTConference[], Error>("../../../ht/index.json", fetcher);

  if (isLoading) {
    return <Loading />;
  }

  if (htConferences === undefined || error !== undefined) {
    return <Error msg={error?.message} />;
  }

  return (
    <div>
      <Head>
        <title>{`HackerTracker / ${conf}`}</title>
        <meta
          property="og:title"
          content={`HackerTracker / ${conf}`}
          key="title"
        />
        <meta name="description" content="HackerTracker" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>
          <Heading conferences={htConferences} />
          {content === "event" ? (
            <Event conf={conf} />
          ) : (
            <Schedule conf={displayConference(conf, htConferences)} />
          )}
        </div>
      </main>
    </div>
  );
}
