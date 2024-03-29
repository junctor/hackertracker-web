import Head from "next/head";
import useSWR from "swr";
import { fetcher } from "../../lib/utils/misc";
import Loading from "@/components/misc/Loading";
import Error from "@/components/misc/Error";
import Heading from "../heading/Heading";
import EventDetails from "./EventDetails";

export default function FetchEvent({
  conf,
  confs,
  eventId,
}: {
  conf: HTConference;
  confs: HTConference[];
  eventId: string;
}) {
  const {
    data: eventsData,
    error: eventsError,
    isLoading: eventsIsLoading,
  } = useSWR<HTEvent[], Error>(
    `../ht/conferences/${conf.code}/events.json`,
    fetcher
  );

  if (eventsIsLoading) {
    return <Loading />;
  }

  if (eventsData === undefined || eventsError !== undefined) {
    return <Error msg={eventsError?.message} />;
  }

  const event = eventsData?.find(
    (e) => e.id.toString().toLowerCase() === eventId.toLowerCase()
  );

  if (event === undefined) {
    return <Error msg="No event found for id" />;
  }

  return (
    <div>
      <Head>
        <title>{`${conf.name}: ${event.title}`}</title>
        <meta name="description" content={`${conf.name} Event`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mb-20">
        <Heading conferences={confs} />
        <EventDetails event={event} />
      </main>
    </div>
  );
}
