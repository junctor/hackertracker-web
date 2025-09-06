import { useMemo, useState, useDeferredValue } from "react";
import { Link } from "react-router";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import type { HTPerson } from "@/types/db";

type SortMode = "name-asc" | "name-desc";

export default function PeopleList({
  confCode,
  people,
}: {
  confCode: string;
  people: HTPerson[];
}) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("name-asc");

  const deferredQuery = useDeferredValue(query);
  const collator = useMemo(
    () => new Intl.Collator(undefined, { sensitivity: "base" }),
    []
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    const base = q
      ? people.filter((p) => p.name.toLowerCase().includes(q))
      : [...people];

    base.sort((a, b) => {
      const cmp = collator.compare(a.name, b.name);
      return sortMode === "name-asc" ? cmp : -cmp;
    });

    return base;
  }, [people, deferredQuery, sortMode, collator]);

  const resultCount = filtered.length;

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
            {resultCount.toLocaleString()}{" "}
            {resultCount === 1 ? "result" : "results"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search people…"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 pl-10 pr-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-80"
              aria-label="Search people"
            />
          </label>

          <label className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.currentTarget.value as SortMode)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Content */}
      {resultCount === 0 ? (
        <EmptyState query={query} />
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {filtered.map((p) => (
            <li key={p.id} className="h-full">
              <Link
                to={`/person?conf=${confCode}&person=${p.id}`}
                className="block h-full rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-750 shadow transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <article className="flex h-48 flex-col justify-center gap-2 p-6 text-center">
                  <h2 className="text-lg font-semibold text-gray-100">
                    {highlight(p.name, query)}
                  </h2>
                  {p.affiliations?.length > 0 && (
                    <div className="mt-1 flex flex-wrap justify-center gap-2">
                      {p.affiliations
                        .filter((a) => a?.organization)
                        .slice(0, 3)
                        .map((a, i) => (
                          <span
                            key={`${a.organization}-${i}`}
                            className="rounded-full border border-gray-600 bg-gray-800/80 px-2 py-0.5 text-xs text-gray-200"
                          >
                            {truncate(a.organization!, 24)}
                          </span>
                        ))}
                    </div>
                  )}
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- helpers ---------- */

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
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
      <mark className="rounded bg-yellow-200/20 px-0.5 text-yellow-200">
        {match}
      </mark>
      {after}
    </>
  );
}

/* ---------- empty ---------- */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 p-10 text-center">
      <p className="text-lg font-medium text-gray-100">No people found</p>
      {query ? (
        <p className="mt-1 text-sm text-gray-400">
          Try a shorter query or check your spelling.
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-400">
          When people are added, they will appear here.
        </p>
      )}
    </div>
  );
}
