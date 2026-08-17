import type { Sortable } from "../types/hackertracker";

import { compareBySortOrder } from "./sort";

const webProtocols = new Set(["http:", "https:"]);
const markdownProtocols = new Set([...webProtocols, "mailto:"]);

function normalizedUrl(
  value: unknown,
  protocols: ReadonlySet<string>,
  base?: string,
): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = base ? new URL(value.trim(), base) : new URL(value.trim());
    return protocols.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export const safeWebUrl = (value: unknown): string | null => normalizedUrl(value, webProtocols);

export const safeMarkdownUrl = (value: unknown): string | null =>
  normalizedUrl(value, markdownProtocols, window.location.origin);

interface LinkSource extends Sortable {
  url: string;
  label?: string;
  title?: string;
  name?: string;
}

export interface SafeExternalLink {
  href: string;
  label: string;
  key: string;
}

export function safeExternalLinks(items: readonly LinkSource[]): SafeExternalLink[] {
  return items
    .flatMap((item, index) => {
      const href = safeWebUrl(item.url);
      if (!href) return [];
      const label = item.label?.trim() || item.title?.trim() || item.name?.trim() || item.url;
      return [{ ...item, href, label, key: `${item.url}-${label}-${index}` }];
    })
    .sort(
      (a, b) =>
        compareBySortOrder(a, b) ||
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
}
