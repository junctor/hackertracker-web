import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
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

export async function getEventsByIds(
  conf: string,
  eventIds: string[]
): Promise<HTEvent[]> {
  if (!eventIds.length) return [];

  const results = await Promise.all(
    eventIds.map(async (id) => {
      const ref = doc(db, "conferences", conf, "events", id);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as HTEvent) : null;
    })
  );

  return results.filter((ev): ev is HTEvent => ev !== null);
}

export async function getEventsByIdsIn(
  conf: string,
  eventIds: (string | number)[]
): Promise<HTEvent[]> {
  const ids = (eventIds ?? []).map(String).slice(0, 10); // Firestore limit = 10
  if (ids.length === 0) return [];

  const ref = collection(db, "conferences", conf, "events");
  const q = query(ref, where("__name__", "in", ids));
  const snap = await getDocs(q);

  const byId = new Map<string, HTEvent>();
  for (const d of snap.docs) {
    byId.set(d.id, d.data() as HTEvent);
  }

  return ids.map((id) => byId.get(id)).filter((e): e is HTEvent => Boolean(e));
}
