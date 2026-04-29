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
import { CACHE_TTL_MS, getCached, getOrSetCached, setCached } from "./cache";

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
  return getOrSetCached(
    conferencesKey(count),
    async () => {
      const ref = collection(db, "conferences");
      const q = query(ref, orderBy("start_timestamp", "desc"), limit(count));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => {
        const data = doc.data() as HTConference;
        return data;
      });
    },
    {
      ttlMs: CACHE_TTL_MS.conferenceList,
      validate: isConferenceList,
      cacheValue: (conferences) => {
        setCached(conferencesKey(count), conferences);
        cacheConferences(conferences);
      },
    },
  );
}

export function getCachedConferenceByCode(code: string): HTConference | undefined {
  return getCached<HTConference>(conferenceKey(code), {
    ttlMs: CACHE_TTL_MS.conference,
    validate: isConference,
  });
}

export async function getConferenceByCode(code: string): Promise<HTConference | null> {
  const cached = getCachedConferenceByCode(code);
  if (cached) return cached;

  return getOrSetCached(
    conferenceKey(code),
    async () => {
      const ref = doc(db, "conferences", code);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return snap.data() as HTConference;
    },
    {
      ttlMs: CACHE_TTL_MS.conference,
      validate: (value): value is HTConference | null => value === null || isConference(value),
    },
  );
}

export async function getUpcomingConferences(): Promise<HTConference[]> {
  return getOrSetCached(
    upcomingConferencesKey,
    async () => {
      const ref = collection(db, "conferences");
      const q = query(
        ref,
        where("end_timestamp", ">=", new Date()),
        orderBy("end_timestamp", "asc"),
        limit(50),
      );
      const snap = await getDocs(q);
      return snap.docs.map((doc) => {
        const data = doc.data() as HTConference;
        return data;
      });
    },
    {
      ttlMs: CACHE_TTL_MS.conferenceList,
      validate: isConferenceList,
      cacheValue: (conferences) => {
        setCached(upcomingConferencesKey, conferences);
        cacheConferences(conferences);
      },
    },
  );
}
