// src/lib/db/conferences.ts
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore/lite";
import { Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { HTConference } from "@/types/db";

type FirebaseConferenceDoc = {
  code: string;
  name: string;
  description?: string;
  timezone: string;
  start_date?: string;
  end_date?: string;
  start_timestamp?: Timestamp;
  end_timestamp?: Timestamp;
  updated_at?: Timestamp;
  codeofconduct?: string | null;
  link?: string | null;
  tagline_text?: string | null;
};

const toConference = (id: string, data: unknown): HTConference => {
  const d = data as FirebaseConferenceDoc;
  return {
    id,
    code: d.code,
    name: d.name,
    description: d.description,
    timezone: d.timezone,
    start_date: d.start_date,
    end_date: d.end_date,
    start_timestamp: d.start_timestamp,
    end_timestamp: d.end_timestamp,
    updated_at: d.updated_at,
    codeofconduct: d.codeofconduct ?? null,
    link: d.link ?? null,
    tagline_text: d.tagline_text ?? null,
  };
};

export async function getConferences(count = 50): Promise<HTConference[]> {
  const ref = collection(db, "conferences");
  const q = query(ref, orderBy("updated_at", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => toConference(doc.id, doc.data()));
}

export async function getClosestUpcomingConference(): Promise<HTConference | null> {
  const ref = collection(db, "conferences");
  const q = query(
    ref,
    where("start_date", ">=", Timestamp.now()),
    orderBy("start_date", "asc"),
    limit(1)
  );
  const s = await getDocs(q);
  if (s.empty) return null;
  const d = s.docs[0];
  return toConference(d.id, d.data());
}
