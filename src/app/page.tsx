"use client";

import { sortConferences } from "@/lib/utils/misc";
import { useRouter } from "next/navigation";
import {
  getClosestUpcomingConference,
  getConferences,
  getMostRecentPastConference,
} from "@/fb/fb";
import firebaseInit from "@/fb/init";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const fbDb = await firebaseInit();

      const [closestUpcomingConference, mostRecentPastConference] =
        await Promise.all([
          getClosestUpcomingConference(fbDb),
          getMostRecentPastConference(fbDb),
        ]);

      let confs: HTConference[] = [];
      if (
        closestUpcomingConference !== null &&
        mostRecentPastConference !== null
      ) {
        confs = [closestUpcomingConference, mostRecentPastConference];
      } else {
        confs = await getConferences(fbDb, 5);
      }

      const conf = sortConferences(confs)[0].code;

      router.push(`/schedule?conf=${conf}`);
    };

    fetchData();
  }, [router]);

  return null;
};

export default Home;
