import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore/lite";

import type { HTEvent } from "@/types/db";

import { db } from "../firebase";
import { CACHE_TTL_MS, getCached, getOrSetCached, setCached } from "./cache";

const eventsKey = (conf: string) => `events:${conf}`;
const eventKey = (conf: string, eventId: number) => `event:${conf}:${eventId}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isEvent(value: unknown): value is HTEvent {
  return isRecord(value) && typeof value.id === "number";
}

function isEventList(value: unknown): value is HTEvent[] {
  return Array.isArray(value) && value.every(isEvent);
}

function getCachedEventList(conf: string) {
  return getCached<HTEvent[]>(eventsKey(conf), {
    ttlMs: CACHE_TTL_MS.events,
    validate: isEventList,
  });
}

export function getCachedEventById(conf: string, eventId: number): HTEvent | undefined {
  const cachedEvents = getCachedEventList(conf);
  const eventFromList = cachedEvents?.find((event) => event.id === eventId);
  if (eventFromList) return eventFromList;

  const cachedEvent = getCached<HTEvent>(eventKey(conf, eventId), {
    ttlMs: CACHE_TTL_MS.events,
    validate: isEvent,
  });
  return cachedEvent?.id === eventId ? cachedEvent : undefined;
}

function eventsByIds(events: HTEvent[], eventIds: number[]) {
  const byId = new Map<number, HTEvent>();
  for (const event of events) byId.set(event.id, event);

  return eventIds
    .map((id) => byId.get(id))
    .filter((event): event is HTEvent => event !== undefined);
}

function eventsByStringIds(events: HTEvent[], eventIds: string[]) {
  const byId = new Map<string, HTEvent>();
  for (const event of events) byId.set(String(event.id), event);

  return eventIds
    .map((id) => byId.get(id))
    .filter((event): event is HTEvent => event !== undefined);
}

export async function getEvents(conf: string): Promise<HTEvent[]> {
  return getOrSetCached(
    eventsKey(conf),
    async () => {
      const ref = collection(db, "conferences", conf, "events");
      const q = query(ref, orderBy("begin_timestamp", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => {
        const data = doc.data() as HTEvent;
        return data;
      });
    },
    { ttlMs: CACHE_TTL_MS.events, validate: isEventList },
  );
}

export async function getEventById(conf: string, eventId: number): Promise<HTEvent | null> {
  const cachedEvent = getCachedEventById(conf, eventId);
  if (cachedEvent) return cachedEvent;

  const ref = doc(db, "conferences", conf, "events", eventId.toString());
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const event = snap.data() as HTEvent;
  setCached(eventKey(conf, eventId), event);
  return event;
}

export async function getEventsByIds(conf: string, eventIds: number[]): Promise<HTEvent[]> {
  if (!eventIds.length) return [];

  const cachedEvents = getCachedEventList(conf);
  if (cachedEvents) return eventsByIds(cachedEvents, eventIds);

  const results = await Promise.all(eventIds.map(async (id) => getEventById(conf, id)));

  return results.filter((ev): ev is HTEvent => ev !== null);
}

export async function getEventsByIdsIn(conf: string, eventIds: number[]): Promise<HTEvent[]> {
  const ids = (eventIds ?? []).map(String).slice(0, 10); // Firestore limit = 10
  if (ids.length === 0) return [];

  const cachedEvents = getCachedEventList(conf);
  if (cachedEvents) return eventsByStringIds(cachedEvents, ids);

  const byId = new Map<string, HTEvent>();
  for (const id of ids) {
    const eventId = Number(id);
    const cachedEvent = getCached<HTEvent>(eventKey(conf, eventId), {
      ttlMs: CACHE_TTL_MS.events,
      validate: isEvent,
    });
    if (cachedEvent && String(cachedEvent.id) === id) {
      byId.set(id, cachedEvent);
    }
  }

  const missingIds = ids.filter((id) => !byId.has(id));
  if (missingIds.length === 0) return eventsByStringIds([...byId.values()], ids);

  const ref = collection(db, "conferences", conf, "events");
  const q = query(ref, where("__name__", "in", missingIds));
  const snap = await getDocs(q);

  for (const d of snap.docs) {
    const event = d.data() as HTEvent;
    byId.set(d.id, event);
    setCached(eventKey(conf, event.id), event);
  }

  return ids.map((id) => byId.get(id)).filter((e): e is HTEvent => Boolean(e));
}
