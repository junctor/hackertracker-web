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
import { Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { HTEvent } from "@/types/db";

/** Exact Firestore event doc shape (as stored) */
type FirebaseEventDoc = {
  title: string;
  type: string;
  description?: string;
  location?: unknown; // map to your HTLocation in UI or here
  begin_timestamp: Timestamp;
  end_timestamp: Timestamp;
  updated_at?: Timestamp;
  tag_ids?: number[];
  tags_text?: string[];
  speaker_ids?: string[];
  links?: unknown[];
};

function toEvent(id: string, data: unknown): HTEvent {
  const d = data as FirebaseEventDoc;
  return {
    id,
    title: d.title,
    type: d.type,
    description: d.description,
    location: (d.location as HTEvent["location"]) ?? null,
    begin_timestamp: d.begin_timestamp,
    end_timestamp: d.end_timestamp,
    updated_at: d.updated_at,
    tag_ids: d.tag_ids,
    tags_text: d.tags_text,
    speaker_ids: d.speaker_ids,
    links: d.links as HTEvent["links"],
  };
}

export async function getEvents(conf: string): Promise<HTEvent[]> {
  const ref = collection(db, "conferences", conf, "events");
  const q = query(ref, orderBy("begin_timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => toEvent(doc.id, doc.data()));
}

export async function getOnNowEvents(conf: string): Promise<HTEvent[]> {
  const now = Timestamp.now();
  const ref = collection(db, "conferences", conf, "events");
  const q = query(
    ref,
    where("begin_timestamp", "<=", now),
    where("end_timestamp", ">=", now),
    orderBy("begin_timestamp", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => toEvent(doc.id, doc.data()));
}

export async function getUpcomingEvents(conf: string): Promise<HTEvent[]> {
  const now = Timestamp.now();
  const twoHours = new Timestamp(now.seconds + 2 * 60 * 60, now.nanoseconds);
  const ref = collection(db, "conferences", conf, "events");
  const q = query(
    ref,
    where("begin_timestamp", ">", now),
    where("begin_timestamp", "<=", twoHours),
    orderBy("begin_timestamp", "asc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => toEvent(doc.id, doc.data()));
}

export async function getEventById(
  conf: string,
  eventId: string
): Promise<HTEvent | null> {
  const ref = doc(db, "conferences", conf, "events", eventId);
  const snap = await getDoc(ref);
  return snap.exists() ? toEvent(snap.id, snap.data()) : null;
}
