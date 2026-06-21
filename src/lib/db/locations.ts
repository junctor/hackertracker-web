import { collection, getDocs } from "firebase/firestore/lite";

import type { HTLocation, Locations } from "@/types/db";

import { db } from "../firebase";
import { CACHE_TTL_MS, getCached, getOrSetCached } from "./cache";

const locationsKey = (conf: string) => `locations:${conf}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isLocation(value: unknown): value is HTLocation {
  return isRecord(value) && typeof value.id === "number" && typeof value.name === "string";
}

function isLocationList(value: unknown): value is Locations {
  return Array.isArray(value) && value.every(isLocation);
}

export function getCachedLocations(conf: string): Locations | undefined {
  return getCached<Locations>(locationsKey(conf), {
    ttlMs: CACHE_TTL_MS.locations,
    validate: isLocationList,
  });
}

export async function getLocations(conf: string): Promise<Locations> {
  return getOrSetCached(
    locationsKey(conf),
    async () => {
      const ref = collection(db, "conferences", conf, "locations");
      const snap = await getDocs(ref);
      return snap.docs.map((doc) => doc.data() as HTLocation);
    },
    { ttlMs: CACHE_TTL_MS.locations, validate: isLocationList },
  );
}
