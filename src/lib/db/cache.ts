const CACHE_PREFIX = "htw:v1";

export const CACHE_TTL_MS = {
  conference: 6 * 60 * 60 * 1000,
  conferenceList: 6 * 60 * 60 * 1000,
  events: 10 * 60 * 1000,
  tags: 10 * 60 * 1000,
  schedule: 10 * 60 * 1000,
  speakers: 10 * 60 * 1000,
} as const;

// Keep the default conservative; callers with known data volatility pass an
// explicit TTL from CACHE_TTL_MS.
export const DEFAULT_CACHE_TTL_MS = CACHE_TTL_MS.events;
const MAX_CACHE_TTL_MS = Math.max(...Object.values(CACHE_TTL_MS));

type CacheEntry<T> = {
  storedAt: number;
  value: T;
};

type CacheValidator<T> = (value: unknown) => value is T;

type CacheReadOptions<T> = {
  ttlMs?: number;
  validate?: CacheValidator<T>;
};

type CachedLoadOptions<T> = CacheReadOptions<T> & {
  cacheValue?: (value: T) => void;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightLoads = new Map<string, Promise<unknown>>();
let hasPrunedCache = false;

const namespacedKey = (key: string) => `${CACHE_PREFIX}:${key}`;

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isCacheEntry(value: unknown): value is CacheEntry<unknown> {
  if (value === null || typeof value !== "object") return false;

  const candidate = value as { storedAt?: unknown; value?: unknown };
  return typeof candidate.storedAt === "number" && "value" in candidate;
}

function isFresh(entry: CacheEntry<unknown>, ttlMs: number): boolean {
  if (ttlMs <= 0) return false;

  const age = Date.now() - entry.storedAt;
  return Number.isFinite(entry.storedAt) && age >= 0 && age <= ttlMs;
}

export function pruneCache(ttlMs = MAX_CACHE_TTL_MS): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  const prefix = `${CACHE_PREFIX}:`;
  const keysToRemove: string[] = [];

  try {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key || !key.startsWith(prefix)) continue;

      const raw = storage.getItem(key);
      if (!raw) {
        keysToRemove.push(key);
        continue;
      }

      try {
        const parsed: unknown = JSON.parse(raw);

        if (!isCacheEntry(parsed) || !isFresh(parsed, ttlMs)) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      try {
        storage.removeItem(key);
        memoryCache.delete(key);
      } catch {
        // Ignore cleanup failures.
      }
    }
  } catch {
    // Ignore pruning failures.
  }
}

function pruneCacheOnce(): void {
  if (hasPrunedCache) return;

  hasPrunedCache = true;
  pruneCache();
}

function isValidValue<T>(value: unknown, validate?: CacheValidator<T>): value is T {
  try {
    return validate ? validate(value) : true;
  } catch {
    return false;
  }
}

function readMemory<T>(
  storageKey: string,
  ttlMs: number,
  validate?: CacheValidator<T>,
): T | undefined {
  try {
    const entry = memoryCache.get(storageKey);
    if (!entry) return undefined;

    if (!isFresh(entry, ttlMs) || !isValidValue(entry.value, validate)) {
      memoryCache.delete(storageKey);
      return undefined;
    }

    return entry.value;
  } catch {
    return undefined;
  }
}

function readLocalStorage<T>(
  storageKey: string,
  ttlMs: number,
  validate?: CacheValidator<T>,
): T | undefined {
  const storage = getBrowserStorage();
  if (!storage) return undefined;

  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return undefined;

    const parsed: unknown = JSON.parse(raw);
    if (!isCacheEntry(parsed) || !isFresh(parsed, ttlMs)) {
      try {
        storage.removeItem(storageKey);
      } catch {
        // Ignore cache cleanup failures.
      }
      return undefined;
    }

    if (!isValidValue(parsed.value, validate)) {
      try {
        storage.removeItem(storageKey);
      } catch {
        // Ignore cache cleanup failures.
      }
      return undefined;
    }

    const entry: CacheEntry<unknown> = {
      storedAt: parsed.storedAt,
      value: parsed.value,
    };

    try {
      memoryCache.set(storageKey, entry);
    } catch {
      // Ignore in-memory cache failures.
    }

    return parsed.value;
  } catch {
    return undefined;
  }
}

export function getCached<T>(key: string, options: CacheReadOptions<T> = {}): T | undefined {
  pruneCacheOnce();

  const storageKey = namespacedKey(key);
  const ttlMs = options.ttlMs ?? DEFAULT_CACHE_TTL_MS;
  const memoryValue = readMemory<T>(storageKey, ttlMs, options.validate);

  if (memoryValue !== undefined) return memoryValue;

  return readLocalStorage<T>(storageKey, ttlMs, options.validate);
}

export function setCached<T>(key: string, value: T): void {
  pruneCacheOnce();

  const storageKey = namespacedKey(key);
  const entry: CacheEntry<T> = {
    storedAt: Date.now(),
    value,
  };

  try {
    memoryCache.set(storageKey, entry);
  } catch {
    // Ignore in-memory cache failures.
  }

  const storage = getBrowserStorage();
  if (!storage) return;

  try {
    storage.setItem(storageKey, JSON.stringify(entry));
  } catch {
    // Ignore quota, serialization, and security failures.
  }
}

export async function getOrSetCached<T>(
  key: string,
  load: () => Promise<T>,
  options: CachedLoadOptions<T> = {},
): Promise<T> {
  const cached = getCached<T>(key, options);
  if (cached !== undefined) return cached;

  const storageKey = namespacedKey(key);
  const existing = inFlightLoads.get(storageKey) as Promise<T> | undefined;
  if (existing) return existing;

  const pending = load()
    .then((value) => {
      if (options.validate && !options.validate(value)) return value;
      if (options.cacheValue) {
        options.cacheValue(value);
      } else {
        setCached(key, value);
      }
      return value;
    })
    .finally(() => {
      inFlightLoads.delete(storageKey);
    });

  inFlightLoads.set(storageKey, pending);
  return pending;
}
