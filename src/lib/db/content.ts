import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore/lite";

import type { Content, HTContent } from "@/types/db";

import { db } from "../firebase";
import { CACHE_TTL_MS, getCached, getOrSetCached, setCached } from "./cache";

const contentKey = (conf: string) => `content:${conf}`;
const contentItemKey = (conf: string, contentId: number) => `content:${conf}:${contentId}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isContentItem(value: unknown): value is HTContent {
  return isRecord(value) && typeof value.id === "number";
}

function isContentList(value: unknown): value is Content {
  return Array.isArray(value) && value.every(isContentItem);
}

function getCachedContentList(conf: string) {
  return getCached<Content>(contentKey(conf), {
    ttlMs: CACHE_TTL_MS.events,
    validate: isContentList,
  });
}

export function getCachedContentById(conf: string, contentId: number): HTContent | undefined {
  const cachedContent = getCachedContentList(conf);
  const contentFromList = cachedContent?.find((content) => content.id === contentId);
  if (contentFromList) return contentFromList;

  const cachedContentItem = getCached<HTContent>(contentItemKey(conf, contentId), {
    ttlMs: CACHE_TTL_MS.events,
    validate: isContentItem,
  });
  return cachedContentItem?.id === contentId ? cachedContentItem : undefined;
}

function contentByIds(contentItems: Content, contentIds: number[]) {
  const byId = new Map<number, HTContent>();
  for (const content of contentItems) byId.set(content.id, content);

  return contentIds
    .map((id) => byId.get(id))
    .filter((content): content is HTContent => content !== undefined);
}

function contentByStringIds(contentItems: Content, contentIds: string[]) {
  const byId = new Map<string, HTContent>();
  for (const content of contentItems) byId.set(String(content.id), content);

  return contentIds
    .map((id) => byId.get(id))
    .filter((content): content is HTContent => content !== undefined);
}

export async function getContent(conf: string): Promise<Content> {
  return getOrSetCached(
    contentKey(conf),
    async () => {
      const ref = collection(db, "conferences", conf, "content");
      const snap = await getDocs(ref);
      return snap.docs.map((doc) => {
        const data = doc.data() as HTContent;
        return data;
      });
    },
    { ttlMs: CACHE_TTL_MS.events, validate: isContentList },
  );
}

export async function getContentById(conf: string, contentId: number): Promise<HTContent | null> {
  const cachedContent = getCachedContentById(conf, contentId);
  if (cachedContent) return cachedContent;

  const ref = doc(db, "conferences", conf, "content", contentId.toString());
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const content = snap.data() as HTContent;
  setCached(contentItemKey(conf, contentId), content);
  return content;
}

export async function getContentByIds(conf: string, contentIds: number[]): Promise<Content> {
  if (!contentIds.length) return [];

  const cachedContent = getCachedContentList(conf);
  if (cachedContent) return contentByIds(cachedContent, contentIds);

  const results = await Promise.all(contentIds.map(async (id) => getContentById(conf, id)));

  return results.filter((content): content is HTContent => content !== null);
}

export async function getContentByIdsIn(conf: string, contentIds: number[]): Promise<Content> {
  const ids = (contentIds ?? []).map(String).slice(0, 10); // Firestore limit = 10
  if (ids.length === 0) return [];

  const cachedContent = getCachedContentList(conf);
  if (cachedContent) return contentByStringIds(cachedContent, ids);

  const byId = new Map<string, HTContent>();
  for (const id of ids) {
    const contentId = Number(id);
    const cachedContent = getCached<HTContent>(contentItemKey(conf, contentId), {
      ttlMs: CACHE_TTL_MS.events,
      validate: isContentItem,
    });
    if (cachedContent && String(cachedContent.id) === id) {
      byId.set(id, cachedContent);
    }
  }

  const missingIds = ids.filter((id) => !byId.has(id));
  if (missingIds.length === 0) return contentByStringIds([...byId.values()], ids);

  const ref = collection(db, "conferences", conf, "content");
  const q = query(ref, where("__name__", "in", missingIds));
  const snap = await getDocs(q);

  for (const d of snap.docs) {
    const content = d.data() as HTContent;
    byId.set(d.id, content);
    setCached(contentItemKey(conf, content.id), content);
  }

  return ids.map((id) => byId.get(id)).filter((content): content is HTContent => Boolean(content));
}
