import { describe, expect, it } from "vite-plus/test";

import type { ConferenceMenuItem } from "../types/hackertracker";

import { resolveMenuItem } from "./menuRoutes";

const menuItem = (fn: string): ConferenceMenuItem => ({
  id: 1,
  titleText: fn,
  function: fn,
  sortOrder: 1,
  appleSfSymbol: "",
  googleMaterialSymbol: "",
  appliedTagIds: [],
  documentId: null,
  menuId: null,
  prohibitTagFilter: false,
});

describe("menu route resolution", () => {
  it("keeps the live feedback form in the conference menu", () => {
    expect(resolveMenuItem("DEFCON34", menuItem("form"))).toMatchObject({
      routeKey: "feedback",
      href: "/defcon34/feedback",
    });
  });

  it("keeps the live product catalog in the conference menu", () => {
    expect(resolveMenuItem("DEFCON34", menuItem("products"))).toMatchObject({
      routeKey: "merch",
      href: "/defcon34/merch",
    });
  });
});
