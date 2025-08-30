import { collection, doc, getDoc, getDocs } from "firebase/firestore/lite";
import { db } from "../firebase";
import type { HTSpeaker } from "@/types/db";

type FirebaseSpeakerDoc = {
  name: string;
  bio?: string;
  title?: string;
  company?: string;
  links?: unknown[];
  media?: unknown[];
};

function toSpeaker(id: string, data: unknown): HTSpeaker {
  const d = data as FirebaseSpeakerDoc;
  return {
    id,
    name: d.name,
    bio: d.bio,
    title: d.title,
    company: d.company,
    links: d.links as HTSpeaker["links"],
    media: d.media as HTSpeaker["media"],
  };
}

export async function getSpeakers(conf: string): Promise<HTSpeaker[]> {
  const ref = collection(db, "conferences", conf, "speakers");
  const snap = await getDocs(ref);
  return snap.docs.map((doc) => toSpeaker(doc.id, doc.data()));
}

export async function getSpeakerById(
  conf: string,
  id: string
): Promise<HTSpeaker | null> {
  const ref = doc(db, "conferences", conf, "speakers", id);
  const snap = await getDoc(ref);
  return snap.exists() ? toSpeaker(snap.id, snap.data()) : null;
}
