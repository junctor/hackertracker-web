import { collection, doc, getDoc, getDocs } from "firebase/firestore/lite";
import { db } from "../firebase";
import type { HTPerson } from "@/types/db";
import { getCached, setCached } from "./cache";

const speakersKey = (conf: string) => `conference:${conf}:speakers`;
const speakerKey = (conf: string, id: number) =>
  `conference:${conf}:speaker:${id}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isSpeaker(value: unknown): value is HTPerson {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string"
  );
}

function isSpeakerList(value: unknown): value is HTPerson[] {
  return Array.isArray(value) && value.every(isSpeaker);
}

function getCachedSpeakerList(conf: string) {
  return getCached<HTPerson[]>(speakersKey(conf), { validate: isSpeakerList });
}

function speakersByIds(speakers: HTPerson[], ids: number[]) {
  const byId = new Map<number, HTPerson>();
  for (const speaker of speakers) byId.set(speaker.id, speaker);

  return ids
    .map((id) => byId.get(id))
    .filter((speaker): speaker is HTPerson => speaker !== undefined);
}

export async function getSpeakers(conf: string): Promise<HTPerson[]> {
  const cached = getCachedSpeakerList(conf);
  if (cached) return cached;

  const ref = collection(db, "conferences", conf, "speakers");
  const snap = await getDocs(ref);
  const speakers = snap.docs.map((doc) => {
    const data = doc.data() as HTPerson;
    return data;
  });

  setCached(speakersKey(conf), speakers);
  return speakers;
}

export async function getSpeakerById(
  conf: string,
  id: number
): Promise<HTPerson | null> {
  const cachedSpeakers = getCachedSpeakerList(conf);
  const speakerFromList = cachedSpeakers?.find((speaker) => speaker.id === id);
  if (speakerFromList) return speakerFromList;

  const cachedSpeaker = getCached<HTPerson>(speakerKey(conf, id), {
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

export async function getSpeakersByIds(
  conf: string,
  ids: number[]
): Promise<HTPerson[]> {
  if (!ids.length) return [];

  const cachedSpeakers = getCachedSpeakerList(conf);
  if (cachedSpeakers) return speakersByIds(cachedSpeakers, ids);

  const promises = ids.map((id) => getSpeakerById(conf, id));
  const results = await Promise.all(promises);
  return results.filter((speaker): speaker is HTPerson => speaker !== null);
}
