import type { ConferenceMenuItem } from "../types/hackertracker";

import {
  bookmarksPath,
  conferenceSectionPath,
  contentListPath,
  documentPath,
  nestedMenuPath,
  peoplePath,
  schedulePath,
} from "./routes";

export type MenuRouteKey =
  | "announcements"
  | "bookmarks"
  | "communities"
  | "content"
  | "contests"
  | "departments"
  | "document"
  | "exhibitors"
  | "locations"
  | "maps"
  | "menu"
  | "people"
  | "schedule"
  | "search"
  | "vendors"
  | "villages";

export interface SupportedMenuItem extends ConferenceMenuItem {
  routeKey: MenuRouteKey;
  href: string;
}

const ORGANIZATION_ROUTES = new Set<MenuRouteKey>([
  "communities",
  "contests",
  "departments",
  "exhibitors",
  "vendors",
  "villages",
]);

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function organizationRoute(item: ConferenceMenuItem): MenuRouteKey | null {
  const candidate = slugify(item.titleText).replace(/-directory$/, "") as MenuRouteKey;
  return ORGANIZATION_ROUTES.has(candidate) ? candidate : null;
}

/**
 * Firestore decides which entries exist. This registry only maps known Hacker
 * Tracker functions to Vue-owned URLs; unsupported functions are omitted.
 */
export function resolveMenuItem(code: string, item: ConferenceMenuItem): SupportedMenuItem | null {
  let routeKey: MenuRouteKey | null = null;
  let href = "";
  switch (item.function) {
    case "news":
      routeKey = "announcements";
      href = conferenceSectionPath(code, routeKey);
      break;
    case "schedule_bookmark":
      routeKey = "bookmarks";
      href = bookmarksPath(code);
      break;
    case "content":
      routeKey = "content";
      href = contentListPath(code);
      break;
    case "schedule":
      routeKey = "schedule";
      href = schedulePath(code);
      break;
    case "people":
      routeKey = "people";
      href = peoplePath(code);
      break;
    case "locations":
    case "maps":
    case "search":
      routeKey = item.function;
      href = conferenceSectionPath(code, routeKey);
      break;
    case "organizations":
      routeKey = organizationRoute(item);
      if (routeKey) href = conferenceSectionPath(code, routeKey);
      break;
    case "document":
      if (item.documentId !== null) {
        routeKey = "document";
        href = documentPath(code, item.documentId);
      }
      break;
    case "menu":
      if (item.menuId !== null) {
        routeKey = "menu";
        href =
          slugify(item.titleText) === "readme-nfo"
            ? conferenceSectionPath(code, "readme.nfo")
            : nestedMenuPath(code, item.menuId);
      }
      break;
  }
  if (!routeKey || !href) {
    if (import.meta.env.DEV)
      console.warn(`Unsupported Hacker Tracker menu function: ${item.function || "(empty)"}`);
    return null;
  }
  return { ...item, routeKey, href };
}

export function resolveMenuItems(code: string, items: ConferenceMenuItem[]): SupportedMenuItem[] {
  return items
    .map((item) => resolveMenuItem(code, item))
    .filter((item): item is SupportedMenuItem => item !== null);
}
