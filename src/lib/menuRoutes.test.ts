import { describe, expect, it, vi } from "vite-plus/test";

import type { ConferenceMenuItem } from "../types/hackertracker";

import { resolveMenuItem } from "./menuRoutes";

const item = (overrides: Partial<ConferenceMenuItem>): ConferenceMenuItem => ({
  id: 1,
  titleText: "Content",
  function: "content",
  sortOrder: 1,
  appleSfSymbol: "",
  googleMaterialSymbol: "",
  appliedTagIds: [],
  documentId: null,
  menuId: null,
  prohibitTagFilter: false,
  ...overrides,
});

describe("Hacker Tracker menu routing", () => {
  it("preserves content filter parameters while mapping the Vue route", () => {
    const resolved = resolveMenuItem(
      "DEFCON34",
      item({ appliedTagIds: [49242], prohibitTagFilter: true }),
    );
    expect(resolved).toMatchObject({
      href: "/defcon34/content",
      routeKey: "content",
      appliedTagIds: [49242],
      prohibitTagFilter: true,
    });
  });

  it("uses document and nested menu identifiers in canonical URLs", () => {
    expect(
      resolveMenuItem(
        "DEFCON34",
        item({ function: "document", titleText: "README", documentId: 675 }),
      )?.href,
    ).toBe("/defcon34/documents/675");
    expect(
      resolveMenuItem("DEFCON34", item({ function: "menu", titleText: "Nodes", menuId: 253 }))
        ?.href,
    ).toBe("/defcon34/menu/253");
  });

  it("maps tag-filtered organization directories without conference manifests", () => {
    expect(
      resolveMenuItem(
        "DCSG2026",
        item({ function: "organizations", titleText: "Villages", appliedTagIds: [48955] }),
      ),
    ).toMatchObject({ href: "/dcsg2026/villages", routeKey: "villages" });
  });

  it("omits unknown future functions", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(resolveMenuItem("DEFCON34", item({ function: "future_feature" }))).toBeNull();
    warning.mockRestore();
  });
});
