// src/lib/db/conferences.ts
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore/lite";
import { db } from "../firebase";
import type { HTConference } from "@/types/db";

export async function getConferences(count = 50): Promise<HTConference[]> {
  const ref = collection(db, "conferences");
  const q = query(ref, orderBy("start_timestamp", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as HTConference;
    return data;
  });
}

export async function getUpcomingConferences(): Promise<HTConference[]> {
  const ref = collection(db, "conferences");
  const q = query(
    ref,
    where("start_timestamp", ">=", new Date()),
    orderBy("start_timestamp", "asc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as HTConference;
    return data;
  });
}
