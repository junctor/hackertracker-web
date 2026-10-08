const CACHE_PREFIX = "htw:v2";
const DATABASE_NAME = "hackertracker-web";
const STORE_NAME = "cache";
const DATABASE_VERSION = 1;

export const cacheTtl = {
  conference: 6 * 60 * 60 * 1000,
  conferenceList: 6 * 60 * 60 * 1000,
  events: 10 * 60 * 1000,
  locations: 10 * 60 * 1000,
  tags: 10 * 60 * 1000,
  speakers: 10 * 60 * 1000,
  menus: 6 * 60 * 60 * 1000,
  organizations: 30 * 60 * 1000,
  documents: 6 * 60 * 60 * 1000,
  articles: 10 * 60 * 1000,
} as const;

interface CacheEntry<T> {
  key: string;
  storedAt: number;
  accessedAt: number;
  value: T;
}

type Validator<T> = (value: unknown) => value is T;

const memory = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const cacheRetention = 7 * 24 * 60 * 60 * 1000;
const pruneInterval = 15 * 60 * 1000;
const maximumEntries = 200;
const maximumMemoryEntries = 100;
let databasePromise: Promise<IDBDatabase | null> | undefined;
let prunePromise: Promise<void> | undefined;
let lastPrunedAt = 0;
let legacyCacheCleared = false;

const cacheKey = (key: string) => `${CACHE_PREFIX}:${key}`;

function remember(entry: CacheEntry<unknown>): void {
  memory.delete(entry.key);
  memory.set(entry.key, entry);
  while (memory.size > maximumMemoryEntries) {
    const oldest = memory.keys().next().value as string | undefined;
    if (!oldest) break;
    memory.delete(oldest);
  }
}

function clearLegacyCache(): void {
  if (legacyCacheCleared || typeof localStorage === "undefined") return;
  legacyCacheCleared = true;
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith("htw:v1:")) localStorage.removeItem(key);
  } catch {
    // Storage may be unavailable; IndexedDB remains the primary cache.
  }
}

function isFresh(entry: CacheEntry<unknown>, ttl: number): boolean {
  const age = Date.now() - entry.storedAt;
  return ttl > 0 && Number.isFinite(entry.storedAt) && age >= 0 && age <= ttl;
}

function valid<T>(value: unknown, validate?: Validator<T>): value is T {
  try {
    return validate ? validate(value) : true;
  } catch {
    return false;
  }
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (databasePromise) return databasePromise;
  clearLegacyCache();
  databasePromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: "key" });
          store.createIndex("accessedAt", "accessedAt");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return databasePromise;
}

async function readStored(key: string): Promise<CacheEntry<unknown> | undefined> {
  const database = await openDatabase();
  if (!database) return undefined;
  return new Promise((resolve) => {
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result as CacheEntry<unknown> | undefined);
      request.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

async function writeStored(entry: CacheEntry<unknown>): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(entry);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function deleteStored(key: string): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function pruneStored(): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  const entries = await new Promise<Array<Pick<CacheEntry<unknown>, "key" | "accessedAt">>>(
    (resolve) => {
      const result: Array<Pick<CacheEntry<unknown>, "key" | "accessedAt">> = [];
      try {
        const transaction = database.transaction(STORE_NAME, "readonly");
        const request = transaction.objectStore(STORE_NAME).index("accessedAt").openKeyCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve(result);
            return;
          }
          if (typeof cursor.primaryKey === "string" && typeof cursor.key === "number") {
            result.push({ key: cursor.primaryKey, accessedAt: cursor.key });
          }
          cursor.continue();
        };
        request.onerror = () => resolve(result);
      } catch {
        resolve(result);
      }
    },
  );
  const expired = entries.filter((entry) => Date.now() - entry.accessedAt > cacheRetention);
  const expiredKeys = new Set(expired.map((entry) => entry.key));
  const retained = entries
    .filter((entry) => !expiredKeys.has(entry.key))
    .sort((a, b) => b.accessedAt - a.accessedAt);
  const overflow = retained.slice(maximumEntries);
  await Promise.all([...expired, ...overflow].map((entry) => deleteStored(entry.key)));
}

function requestPrune(): Promise<void> {
  if (prunePromise) return prunePromise;
  if (Date.now() - lastPrunedAt < pruneInterval) return Promise.resolve();
  prunePromise = pruneStored().finally(() => {
    lastPrunedAt = Date.now();
    prunePromise = undefined;
  });
  return prunePromise;
}

export function getCached<T>(key: string, ttl: number, validate?: Validator<T>): T | undefined {
  const entry = memory.get(cacheKey(key));
  if (!entry) return undefined;
  if (!valid(entry.value, validate)) {
    memory.delete(entry.key);
    void deleteStored(entry.key);
    return undefined;
  }
  if (!isFresh(entry, ttl)) return undefined;
  entry.accessedAt = Date.now();
  remember(entry);
  return entry.value;
}

export function setMemoryCached<T>(key: string, value: T): void {
  const now = Date.now();
  const resolvedKey = cacheKey(key);
  remember({ key: resolvedKey, storedAt: now, accessedAt: now, value });
}

export function setCached<T>(key: string, value: T): void {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    key: cacheKey(key),
    storedAt: now,
    accessedAt: now,
    value,
  };
  remember(entry);
  void writeStored(entry).then(() => requestPrune());
}

export async function cachedLoad<T>(
  key: string,
  ttl: number,
  load: () => Promise<T>,
  validate?: Validator<T>,
  onCache?: (value: T) => void,
): Promise<T> {
  const resolvedKey = cacheKey(key);
  const current = inFlight.get(resolvedKey) as Promise<T> | undefined;
  if (current) return current;

  const pending = (async () => {
    void requestPrune();
    const fromMemory = memory.get(resolvedKey);
    let stale: T | undefined;
    if (fromMemory && valid(fromMemory.value, validate) && isFresh(fromMemory, ttl)) {
      fromMemory.accessedAt = Date.now();
      remember(fromMemory);
      return fromMemory.value;
    }
    if (fromMemory && valid(fromMemory.value, validate) && isFresh(fromMemory, cacheRetention)) {
      stale = fromMemory.value;
    } else if (fromMemory) {
      memory.delete(resolvedKey);
    }

    const stored = await readStored(resolvedKey);
    if (stored && valid(stored.value, validate) && isFresh(stored, cacheRetention)) {
      stored.accessedAt = Date.now();
      remember(stored);
      void writeStored(stored);
      if (isFresh(stored, ttl)) return stored.value;
      stale = stored.value;
    } else if (stored) {
      void deleteStored(resolvedKey);
    }

    try {
      const value = await load();
      if (!validate || validate(value)) (onCache ?? ((result) => setCached(key, result)))(value);
      return value;
    } catch (error) {
      if (stale !== undefined) return stale;
      throw error;
    }
  })().finally(() => inFlight.delete(resolvedKey));

  inFlight.set(resolvedKey, pending);
  return pending;
}
