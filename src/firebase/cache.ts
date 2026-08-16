const CACHE_PREFIX = "htw:v1";

export const cacheTtl = {
  conference: 6 * 60 * 60 * 1000,
  conferenceList: 6 * 60 * 60 * 1000,
  events: 10 * 60 * 1000,
  locations: 10 * 60 * 1000,
  tags: 10 * 60 * 1000,
  schedule: 10 * 60 * 1000,
  speakers: 10 * 60 * 1000,
  menus: 6 * 60 * 60 * 1000,
  organizations: 30 * 60 * 1000,
  documents: 6 * 60 * 60 * 1000,
  articles: 10 * 60 * 1000,
} as const;

interface CacheEntry<T> {
  storedAt: number;
  value: T;
}

type Validator<T> = (value: unknown) => value is T;

const memory = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const maximumTtl = Math.max(...Object.values(cacheTtl));
let pruned = false;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isEntry(value: unknown): value is CacheEntry<unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { storedAt?: unknown }).storedAt === "number" &&
    "value" in value
  );
}

function isFresh(entry: CacheEntry<unknown>, ttl: number): boolean {
  const age = Date.now() - entry.storedAt;
  return ttl > 0 && Number.isFinite(entry.storedAt) && age >= 0 && age <= ttl;
}

function pruneOnce(): void {
  if (pruned) return;
  pruned = true;
  const target = storage();
  if (!target) return;
  const prefix = `${CACHE_PREFIX}:`;
  try {
    const keys = Array.from({ length: target.length }, (_, index) => target.key(index)).filter(
      (key): key is string => Boolean(key?.startsWith(prefix)),
    );
    for (const key of keys) {
      try {
        const raw = target.getItem(key);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        if (!isEntry(parsed) || !isFresh(parsed, maximumTtl)) target.removeItem(key);
      } catch {
        target.removeItem(key);
      }
    }
  } catch {
    // Storage can be disabled or restricted without affecting the app.
  }
}

function valid<T>(value: unknown, validate?: Validator<T>): value is T {
  try {
    return validate ? validate(value) : true;
  } catch {
    return false;
  }
}

export function getCached<T>(key: string, ttl: number, validate?: Validator<T>): T | undefined {
  pruneOnce();
  const cacheKey = `${CACHE_PREFIX}:${key}`;
  const fromMemory = memory.get(cacheKey);
  if (fromMemory) {
    if (isFresh(fromMemory, ttl) && valid(fromMemory.value, validate)) return fromMemory.value;
    memory.delete(cacheKey);
  }

  const target = storage();
  if (!target) return undefined;
  try {
    const raw = target.getItem(cacheKey);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!isEntry(parsed) || !isFresh(parsed, ttl) || !valid(parsed.value, validate)) {
      if (raw) target.removeItem(cacheKey);
      return undefined;
    }
    memory.set(cacheKey, parsed);
    return parsed.value;
  } catch {
    return undefined;
  }
}

export function setCached<T>(key: string, value: T): void {
  pruneOnce();
  const cacheKey = `${CACHE_PREFIX}:${key}`;
  const entry: CacheEntry<T> = { storedAt: Date.now(), value };
  memory.set(cacheKey, entry);
  try {
    storage()?.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // Cache quota and privacy errors are non-fatal.
  }
}

export async function cachedLoad<T>(
  key: string,
  ttl: number,
  load: () => Promise<T>,
  validate?: Validator<T>,
  onCache?: (value: T) => void,
): Promise<T> {
  const cached = getCached(key, ttl, validate);
  if (cached !== undefined) return cached;
  const cacheKey = `${CACHE_PREFIX}:${key}`;
  const current = inFlight.get(cacheKey) as Promise<T> | undefined;
  if (current) return current;
  const pending = load()
    .then((value) => {
      if (!validate || validate(value)) (onCache ?? ((result) => setCached(key, result)))(value);
      return value;
    })
    .finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, pending);
  return pending;
}
