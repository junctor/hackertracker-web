import { collection, getDocs } from "firebase/firestore/lite";

import type { HTTagGroup } from "@/types/db";

import { db } from "../firebase";
import { CACHE_TTL_MS, getCached, getOrSetCached } from "./cache";

const tagsKey = (conf: string) => `tags:${conf}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isTagGroup(value: unknown): value is HTTagGroup {
  return isRecord(value) && Array.isArray(value.tags);
}

function isTagGroupList(value: unknown): value is HTTagGroup[] {
  return Array.isArray(value) && value.every(isTagGroup);
}

export function getCachedTags(conf: string): HTTagGroup[] | undefined {
  return getCached<HTTagGroup[]>(tagsKey(conf), {
    ttlMs: CACHE_TTL_MS.tags,
    validate: isTagGroupList,
  });
}

export async function getTags(conf: string): Promise<HTTagGroup[]> {
  return getOrSetCached(
    tagsKey(conf),
    async () => {
      const ref = collection(db, "conferences", conf, "tagtypes");
      const snap = await getDocs(ref);
      return snap.docs.flatMap((d) => d.data() as unknown as HTTagGroup[]) ?? [];
    },
    { ttlMs: CACHE_TTL_MS.tags, validate: isTagGroupList },
  );
}
