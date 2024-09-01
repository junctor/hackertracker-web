"use client";

import { sortConferences } from "@/lib/utils/misc";
import { redirect } from "next/navigation";
import {
  getClosestUpcomingConference,
  getConferences,
  getMostRecentPastConference,
} from "@/fb/fb";
import firebaseInit from "@/fb/init";

export default async function Home() {
  const fbDb = await firebaseInit();

  const [closestUpcomingConference, mostRecentPastConference] =
    await Promise.all([
      getClosestUpcomingConference(fbDb),
      getMostRecentPastConference(fbDb),
    ]);

  let confs: HTConference[] = [];
  if (closestUpcomingConference !== null && mostRecentPastConference !== null) {
    confs = [closestUpcomingConference, mostRecentPastConference];
  } else {
    confs = await getConferences(fbDb, 5);
  }

  const conf = sortConferences(confs)[0].code;

  return redirect(`/schedule?conf=${conf}`);
}
