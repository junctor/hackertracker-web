import { collection, doc, getDoc, getDocs } from "firebase/firestore/lite";

import type { HTPerson } from "@/types/db";

import { db } from "../firebase";
import { CACHE_TTL_MS, getCached, getOrSetCached, setCached } from "./cache";

const speakersKey = (conf: string) => `speakers:${conf}`;
const speakerKey = (conf: string, id: number) => `speaker:${conf}:${id}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isSpeaker(value: unknown): value is HTPerson {
  return isRecord(value) && typeof value.id === "number" && typeof value.name === "string";
}

function isSpeakerList(value: unknown): value is HTPerson[] {
  return Array.isArray(value) && value.every(isSpeaker);
}

function getCachedSpeakerList(conf: string) {
  return getCached<HTPerson[]>(speakersKey(conf), {
    ttlMs: CACHE_TTL_MS.speakers,
    validate: isSpeakerList,
  });
}

function speakersByIds(speakers: HTPerson[], ids: number[]) {
  const byId = new Map<number, HTPerson>();
  for (const speaker of speakers) byId.set(speaker.id, speaker);

  return ids
    .map((id) => byId.get(id))
    .filter((speaker): speaker is HTPerson => speaker !== undefined);
}

export async function getSpeakers(conf: string): Promise<HTPerson[]> {
  return getOrSetCached(
    speakersKey(conf),
    async () => {
      const ref = collection(db, "conferences", conf, "speakers");
      const snap = await getDocs(ref);
      return snap.docs.map((doc) => {
        const data = doc.data() as HTPerson;
        return data;
      });
    },
    { ttlMs: CACHE_TTL_MS.speakers, validate: isSpeakerList },
  );
}

export async function getSpeakerById(conf: string, id: number): Promise<HTPerson | null> {
  const cachedSpeakers = getCachedSpeakerList(conf);
  const speakerFromList = cachedSpeakers?.find((speaker) => speaker.id === id);
  if (speakerFromList) return speakerFromList;

  const cachedSpeaker = getCached<HTPerson>(speakerKey(conf, id), {
    ttlMs: CACHE_TTL_MS.speakers,
    validate: isSpeaker,
  });
  if (cachedSpeaker?.id === id) return cachedSpeaker;

  const ref = doc(db, "conferences", conf, "speakers", id.toString());
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const speaker = snap.data() as HTPerson;
  setCached(speakerKey(conf, id), speaker);
  return speaker;
}

export async function getSpeakersByIds(conf: string, ids: number[]): Promise<HTPerson[]> {
  if (!ids.length) return [];

  const cachedSpeakers = getCachedSpeakerList(conf);
  if (cachedSpeakers) return speakersByIds(cachedSpeakers, ids);

  const promises = ids.map((id) => getSpeakerById(conf, id));
  const results = await Promise.all(promises);
  return results.filter((speaker): speaker is HTPerson => speaker !== null);
}
