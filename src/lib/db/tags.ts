import { collection, getDocs } from "firebase/firestore/lite";

import type { HTTagGroup } from "@/types/db";

import { db } from "../firebase";
import { getCached, setCached } from "./cache";

const tagsKey = (conf: string) => `conference:${conf}:tags`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isTagGroup(value: unknown): value is HTTagGroup {
  return isRecord(value) && Array.isArray(value.tags);
}

function isTagGroupList(value: unknown): value is HTTagGroup[] {
  return Array.isArray(value) && value.every(isTagGroup);
}

export async function getTags(conf: string): Promise<HTTagGroup[]> {
  const cached = getCached<HTTagGroup[]>(tagsKey(conf), {
    validate: isTagGroupList,
  });
  if (cached) return cached;

  const ref = collection(db, "conferences", conf, "tagtypes");
  const snap = await getDocs(ref);
  const flattened = snap.docs.flatMap((d) => d.data() as unknown as HTTagGroup[]) ?? [];
  setCached(tagsKey(conf), flattened);
  return flattened;
}
