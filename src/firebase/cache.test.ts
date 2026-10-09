import { describe, expect, it, vi } from "vite-plus/test";

import { cachedLoad, getCached, setCached } from "./cache";

describe("client cache", () => {
  it("deduplicates concurrent loads and primes the memory cache", async () => {
    const load = vi.fn(async () => ({ id: 1 }));
    const key = `test:${crypto.randomUUID()}`;

    const [first, second] = await Promise.all([
      cachedLoad(key, 1_000, load),
      cachedLoad(key, 1_000, load),
    ]);

    expect(first).toEqual({ id: 1 });
    expect(second).toBe(first);
    expect(load).toHaveBeenCalledTimes(1);
    expect(getCached(key, 1_000)).toBe(first);
  });

  it("rejects memory entries that fail validation", () => {
    const key = `test:${crypto.randomUUID()}`;
    setCached(key, { id: "invalid" });

    expect(
      getCached(key, 1_000, (value): value is { id: number } =>
        Boolean(
          value && typeof value === "object" && typeof (value as { id?: unknown }).id === "number",
        ),
      ),
    ).toBeUndefined();
  });
});
