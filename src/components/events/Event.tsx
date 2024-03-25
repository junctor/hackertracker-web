"use client";

import useSWR from "swr";
import { fetcher } from "../../lib/utils/misc";
import Loading from "@/components/misc/Loading";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import FetchEvent from "./FetchEvent";

export default function Event() {
  const searchParams = useSearchParams();

  const {
    data: htData,
    error: htError,
    isLoading: htIsLoading,
  } = useSWR<HTConference[], Error>("/ht/index.json", fetcher);

  if (htIsLoading) {
    return <Loading />;
  }

  if (htData === undefined || htError !== undefined) {
    return <Error msg={htError?.message} />;
  }

  const confCode = searchParams.get("c");
  const eventId = searchParams.get("e");

  if (
    eventId == null ||
    eventId === "" ||
    confCode == null ||
    confCode === ""
  ) {
    return <Error msg="No conference or event id provided" />;
  }

  const conf = htData?.find(
    (c) => c.code.toString().toLowerCase() === confCode.toLowerCase()
  );

  if (conf === undefined) {
    return <Error msg="No conference found for id" />;
  }

  return <FetchEvent conf={conf} confs={htData} eventId={eventId} />;
}
