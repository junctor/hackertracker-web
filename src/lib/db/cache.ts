const CACHE_PREFIX = "htw:v1";

// Conference schedule data changes infrequently, so prefer fast navigation
// over frequent Firestore revalidation.
export const DEFAULT_CACHE_TTL_MS = 4 * 60 * 60 * 1000;

type CacheEntry<T> = {
  storedAt: number;
  value: T;
};

type CacheValidator<T> = (value: unknown) => value is T;

type CacheReadOptions<T> = {
  ttlMs?: number;
  validate?: CacheValidator<T>;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

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
  const age = Date.now() - entry.storedAt;
  return Number.isFinite(entry.storedAt) && age >= 0 && age <= ttlMs;
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
  const storageKey = namespacedKey(key);
  const ttlMs = options.ttlMs ?? DEFAULT_CACHE_TTL_MS;
  const memoryValue = readMemory<T>(storageKey, ttlMs, options.validate);

  if (memoryValue !== undefined) return memoryValue;

  return readLocalStorage<T>(storageKey, ttlMs, options.validate);
}

export function setCached<T>(key: string, value: T): void {
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
