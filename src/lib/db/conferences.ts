import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore/lite";

import type { HTConference } from "@/types/db";

import { db } from "../firebase";
import { getCached, setCached } from "./cache";

const conferencesKey = (count: number) => `conferences:list:${count}`;
const conferenceKey = (code: string) => `conference:${code}`;
const upcomingConferencesKey = "conferences:upcoming";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isConference(value: unknown): value is HTConference {
  return isRecord(value) && typeof value.code === "string";
}

function isConferenceList(value: unknown): value is HTConference[] {
  return Array.isArray(value) && value.every(isConference);
}

function cacheConferences(conferences: HTConference[]) {
  for (const conf of conferences) {
    if (conf.code) setCached(conferenceKey(conf.code), conf);
  }
}

export async function getConferences(count = 50): Promise<HTConference[]> {
  const cached = getCached<HTConference[]>(conferencesKey(count), {
    validate: isConferenceList,
  });
  if (cached) return cached;

  const ref = collection(db, "conferences");
  const q = query(ref, orderBy("start_timestamp", "desc"), limit(count));
  const snap = await getDocs(q);
  const conferences = snap.docs.map((doc) => {
    const data = doc.data() as HTConference;
    return data;
  });

  setCached(conferencesKey(count), conferences);
  cacheConferences(conferences);
  return conferences;
}

export async function getConferenceByCode(code: string): Promise<HTConference | null> {
  const cached = getCached<HTConference>(conferenceKey(code), {
    validate: isConference,
  });
  if (cached) return cached;

  const ref = doc(db, "conferences", code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as HTConference;
  setCached(conferenceKey(code), data);
  return data;
}

export async function getUpcomingConferences(): Promise<HTConference[]> {
  const cached = getCached<HTConference[]>(upcomingConferencesKey, {
    validate: isConferenceList,
  });
  if (cached) return cached;

  const ref = collection(db, "conferences");
  const q = query(
    ref,
    where("end_timestamp", ">=", new Date()),
    orderBy("end_timestamp", "asc"),
    limit(50),
  );
  const snap = await getDocs(q);
  const conferences = snap.docs.map((doc) => {
    const data = doc.data() as HTConference;
    return data;
  });

  setCached(upcomingConferencesKey, conferences);
  cacheConferences(conferences);
  return conferences;
}
