"use client";

import Loading from "@/components/misc/Loading";
import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { useEffect, useState } from "react";
import People from "@/components/people/people";
import firebaseInit from "@/fb/init";
import { getConferences, getSpeakers } from "@/fb/fb";

const PeoplePageContent = () => {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confs, setConfs] = useState<HTConference[]>([]);
  const [conf, setConf] = useState<HTConference | null>(null);
  const [htSpeakers, setHtSpeakers] = useState<HTSpeaker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (confCode === null) {
        setError("No conference provided");
        setLoading(false);
        return;
      }

      try {
        const fbDb = await firebaseInit();
        const fetchedConfs = await getConferences(fbDb, 25);
        const conf = fetchedConfs.find((c) => c.code === confCode);

        if (conf === undefined) {
          setError("Conference not found");
          setLoading(false);
          return;
        }

        setConf(conf);

        const speakers = await getSpeakers(fbDb, conf.code);
        setConfs(fetchedConfs);
        setHtSpeakers(speakers);
      } catch {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [confCode]);

  if (loading) {
    return <Loading />;
  }

  if (error !== null) {
    return <Error msg={error} />;
  }

  if (conf === null) {
    return <Error msg="Conference not found" />;
  }

  return (
    <>
      <Heading conf={conf} conferences={confs} />
      <People people={htSpeakers} conf={conf} />
    </>
  );
};

export default function PeoplePage() {
  return (
    <React.Suspense fallback={<Loading />}>
      <PeoplePageContent />
    </React.Suspense>
  );
}
