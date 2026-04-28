import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import { useMemo, useState, useDeferredValue, type CSSProperties } from "react";
import { Link } from "react-router";

import type { HTPerson } from "@/types/db";

type SortMode = "name-asc" | "name-desc";

const PERSON_ACCENT_COLORS = ["#017FA4", "#2D7FF9", "#0F766E", "#7C3AED", "#C2410C", "#0E7490"];

export default function PeopleList({ confCode, people }: { confCode: string; people: HTPerson[] }) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("name-asc");
  const [brokenAvatarIds, setBrokenAvatarIds] = useState<Record<number, true>>({});

  const deferredQuery = useDeferredValue(query);
  const collator = useMemo(() => new Intl.Collator(undefined, { sensitivity: "base" }), []);

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    const base = q
      ? people.filter((p) => {
          const haystack = [
            getDisplayName(p.name),
            getDisplayTitle(p.title),
            ...(p.affiliations ?? []).flatMap((a) => [a.organization, a.title]),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : [...people];

    base.sort((a, b) => {
      const cmp = collator.compare(a.name, b.name);
      return sortMode === "name-asc" ? cmp : -cmp;
    });

    return base;
  }, [people, deferredQuery, sortMode, collator]);

  const resultCount = filtered.length;
  const trimmedQuery = query.trim();

  return (
    <section className="mx-auto my-10 max-w-7xl px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 md:text-4xl">
            People
          </h1>
          <span
            className="rounded-full border border-gray-700 bg-gray-900/60 px-2 py-0.5 text-xs text-gray-300"
            aria-live="polite"
          >
            {resultCount.toLocaleString()} {resultCount === 1 ? "result" : "results"}
          </span>
        </div>

        {/* Controls */}
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <label className="relative block">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search people…"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pr-3 pl-10 text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:w-80"
              aria-label="Search people"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="sr-only">Sort people</span>
            <FunnelIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.currentTarget.value as SortMode)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
            </select>
          </label>
        </form>
      </div>

      {/* Content */}
      {resultCount === 0 ? (
        <EmptyState query={trimmedQuery} onClear={() => setQuery("")} />
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {filtered.map((p) => {
            const personName = getDisplayName(p.name);
            const personTitle = getDisplayTitle(p.title);
            const personInitials = getInitials(p.name);
            const avatarUrl = getPersonAvatarUrl(p);
            const showAvatarImage = Boolean(avatarUrl) && !brokenAvatarIds[p.id];
            const accentColor = getPersonAccent(p.name);
            const accentStyle = {
              "--event-color": accentColor,
            } as CSSProperties;
            const avatarStyle = {
              backgroundImage: `linear-gradient(135deg, ${accentColor}22 0%, rgba(15, 23, 42, 0.9) 100%)`,
            } as CSSProperties;
            const affiliationLabel = getAffiliationLabel(p);

            return (
              <li key={p.id} className="h-full">
                <article
                  style={accentStyle}
                  className="ui-card ui-card-interactive group relative h-full overflow-hidden"
                >
                  <span aria-hidden="true" className="ui-accent-rail" />
                  <span aria-hidden="true" className="ui-accent-rail-overlay" />

                  <Link
                    to={`/person?conf=${encodeURIComponent(confCode)}&person=${p.id}`}
                    className="ui-focus-ring relative z-10 block h-full rounded-[inherit] px-4 py-3.5 pl-5 focus:outline-none sm:px-5 sm:py-4 sm:pl-6"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        style={avatarStyle}
                        className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      >
                        {showAvatarImage && avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={() =>
                              setBrokenAvatarIds((current) =>
                                current[p.id] ? current : { ...current, [p.id]: true },
                              )
                            }
                          />
                        ) : (
                          <>
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_62%)]"
                            />
                            {personInitials ? (
                              <span className="relative text-xs font-semibold tracking-[0.08em] text-gray-100 uppercase">
                                {personInitials}
                              </span>
                            ) : (
                              <UserIcon
                                className="relative h-5 w-5 text-gray-100"
                                aria-hidden="true"
                              />
                            )}
                          </>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-[1rem] leading-6 font-semibold text-gray-100 transition-colors group-hover:text-white">
                          <span className="line-clamp-2">{highlight(personName, query)}</span>
                        </h2>
                        {personTitle ? (
                          <p className="line-clamp-2 text-sm leading-5 text-gray-400">
                            {personTitle}
                          </p>
                        ) : affiliationLabel ? (
                          <p className="line-clamp-2 text-sm leading-5 text-gray-400">
                            {affiliationLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ---------- helpers ---------- */

type AvatarRecord = {
  avatar?: { url?: string | null } | string | null;
  avatarUrl?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  name?: string | null;
};

function getTrimmedText(value?: string | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getPersonName(name?: string | null): string {
  return getTrimmedText(name).replace(/\s+/g, " ");
}

function getDisplayName(name?: string | null): string {
  return getPersonName(name) || "Unknown person";
}

function getDisplayTitle(title?: string | null): string | null {
  return getTrimmedText(title) || null;
}

function getPersonAvatarUrl(person: AvatarRecord): string | null {
  const nestedAvatar = person.avatar;
  const nestedAvatarUrl =
    typeof nestedAvatar === "string"
      ? nestedAvatar
      : nestedAvatar && typeof nestedAvatar.url === "string"
        ? nestedAvatar.url
        : null;

  const candidates = [person.avatarUrl, person.imageUrl, person.image, nestedAvatarUrl];

  for (const candidate of candidates) {
    const normalized = getTrimmedText(candidate);
    if (normalized) return normalized;
  }

  return null;
}

function getInitials(name?: string | null): string {
  const normalizedName = getPersonName(name);
  if (!normalizedName) return "";

  return normalizedName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getPersonAccent(name?: string | null): string {
  const normalizedName = getDisplayName(name);
  let hash = 0;
  for (const char of normalizedName) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return PERSON_ACCENT_COLORS[hash % PERSON_ACCENT_COLORS.length] ?? PERSON_ACCENT_COLORS[0];
}

function getAffiliationLabel(person: HTPerson): string | null {
  const firstAffiliation = (person.affiliations ?? []).find(
    (affiliation) => getTrimmedText(affiliation.title) || getTrimmedText(affiliation.organization),
  );

  if (!firstAffiliation) return null;

  const title = getDisplayTitle(firstAffiliation.title);
  const organization = getDisplayTitle(firstAffiliation.organization);
  if (title && organization) return `${title} @ ${organization}`;
  return title ?? organization;
}

function highlight(text: string, rawQuery: string) {
  const q = rawQuery.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <>
      {before}
      <mark className="rounded bg-yellow-200/20 px-0.5 text-yellow-200">{match}</mark>
      {after}
    </>
  );
}

/* ---------- empty ---------- */

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="ui-empty-state mx-auto max-w-md">
      <p className="text-lg font-medium text-gray-100">No people found</p>
      {query ? (
        <>
          <p className="mt-1 text-sm text-gray-400">No people found for &quot;{query}&quot;.</p>
          <button
            type="button"
            onClick={onClear}
            className="ui-focus-ring mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-gray-200 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100 focus:outline-none"
          >
            Clear search
          </button>
        </>
      ) : (
        <p className="mt-1 text-sm text-gray-400">When people are added, they will appear here.</p>
      )}
    </div>
  );
}
