import { beforeEach, describe, expect, it } from "vite-plus/test";

import { loadBookmarks, toggleBookmark } from "./bookmarks";

const values = new Map<string, string>();

beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
});

describe("bookmarks", () => {
  it("persists additions and removals per conference", () => {
    expect([...toggleBookmark("CONF", 42)]).toEqual([42]);
    expect(loadBookmarks("CONF").has(42)).toBe(true);
    expect([...toggleBookmark("CONF", 42)]).toEqual([]);
    expect(loadBookmarks("CONF").has(42)).toBe(false);
  });

  it("can toggle existing in-memory state when storage is unavailable", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("Storage disabled");
        },
        setItem: () => {
          throw new Error("Storage disabled");
        },
      },
    });

    const added = toggleBookmark("CONF", 42, new Set());
    expect([...added]).toEqual([42]);
    expect([...toggleBookmark("CONF", 42, added)]).toEqual([]);
  });
});
