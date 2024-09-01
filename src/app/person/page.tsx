"use client";

import Loading from "@/components/misc/Loading";

import Error from "@/components/misc/Error";
import { useSearchParams } from "next/navigation";
import Heading from "@/components/heading/Heading";
import React, { useEffect, useState } from "react";
import Person from "@/components/people/person";
import firebaseInit from "@/fb/init";
import { getConferences, getEvents, getSpeakerById } from "@/fb/fb";

const PersonPageContent = () => {
  const searchParams = useSearchParams();
  const confCode = searchParams.get("conf");
  const personId = searchParams.get("person");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conf, setConf] = useState<HTConference | null>(null);
  const [confs, setConfs] = useState<HTConference[]>([]);
  const [person, setPerson] = useState<HTSpeaker | null>(null);
  const [htEvents, setHtEvents] = useState<HTEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (confCode === null || personId === null) {
        setError("No conference or person code provided");
        setLoading(false);
        return;
      }

      try {
        const fbDb = await firebaseInit();
        const confs = await getConferences(fbDb, 25);
        const foundConf = confs.find((c) => c.code === confCode);
        setConfs(confs);

        if (foundConf === undefined) {
          setError("Conference not found");
          setLoading(false);
          return;
        }

        const foundPerson = await getSpeakerById(
          fbDb,
          foundConf.code,
          personId
        );

        if (foundPerson === null) {
          setError("No person found for id");
          setLoading(false);
          return;
        }

        const events = await getEvents(fbDb, foundConf.code);

        setConf(foundConf);
        setPerson(foundPerson);
        setHtEvents(events);
      } catch {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [confCode, personId]);

  if (loading) {
    return <Loading />;
  }

  if (error !== null) {
    return <Error msg={error} />;
  }

  if (conf === null) {
    return <Error msg="Conference not found" />;
  }

  if (person === null) {
    return <Error msg="Person not found" />;
  }

  return (
    <>
      <title>{`${person?.name} | ${conf?.name}`}</title>
      <meta name="description" content={`${person?.name} | ${conf?.name} `} />
      <link rel="icon" href="/favicon.ico" />

      <main>
        <Heading conf={conf} conferences={confs} />
        <Person person={person} conf={conf} events={htEvents} />
      </main>
    </>
  );
};

export default PersonPageContent;
