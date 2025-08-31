import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore/lite";
import { db } from "../firebase";
import type { HTEvent } from "@/types/db";

export async function getEvents(conf: string): Promise<HTEvent[]> {
  const ref = collection(db, "conferences", conf, "events");
  const q = query(ref, orderBy("begin_timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as HTEvent;
    return data;
  });
}

export async function getEventById(
  conf: string,
  eventId: string
): Promise<HTEvent | null> {
  const ref = doc(db, "conferences", conf, "events", eventId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as HTEvent) : null;
}
