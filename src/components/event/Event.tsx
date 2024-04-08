import useSWR from "swr";
import { fetcher } from "../../lib/utils/misc";
import Loading from "@/components/misc/Loading";
import Error from "@/components/misc/Error";
import EventDetails from "./EventDetails";
import { useSearchParams } from "next/navigation";

export default function Event({ conf }: { conf: string }) {
  const searchParams = useSearchParams();

  const {
    data: eventsData,
    error: eventsError,
    isLoading: eventsIsLoading,
  } = useSWR<HTEvent[], Error>(
    `../../../ht/conferences/${conf}/events.json`,
    fetcher
  );

  if (eventsIsLoading) {
    return <Loading />;
  }

  if (eventsData === undefined || eventsError !== undefined) {
    return <Error msg={eventsError?.message} />;
  }

  const eventId = searchParams.get("id");

  if (eventId == null || eventId === "") {
    return <Error msg="No event id provided" />;
  }

  const event = eventsData?.find(
    (e) => e.id.toString().toLowerCase() === eventId.toLowerCase()
  );

  if (event === undefined) {
    return <Error msg="No event found for id" />;
  }

  return (
    <div>
      <EventDetails event={event} />
    </div>
  );
}
