import { collection, doc, getDoc, getDocs } from "firebase/firestore/lite";
import { db } from "../firebase";
import type { HTPerson } from "@/types/db";

export async function getSpeakers(conf: string): Promise<HTPerson[]> {
  const ref = collection(db, "conferences", conf, "speakers");
  const snap = await getDocs(ref);
  return snap.docs.map((doc) => {
    const data = doc.data() as HTPerson;
    return data;
  });
}

export async function getSpeakerById(
  conf: string,
  id: number
): Promise<HTPerson | null> {
  const ref = doc(db, "conferences", conf, "speakers", id.toString());
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as HTPerson) : null;
}

export async function getSpeakersByIds(
  conf: string,
  ids: number[]
): Promise<HTPerson[]> {
  const promises = ids.map((id) => getSpeakerById(conf, id));
  const results = await Promise.all(promises);
  return results.filter((speaker): speaker is HTPerson => speaker !== null);
}
