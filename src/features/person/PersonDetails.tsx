import { useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowLeftIcon,
  LinkIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import type { HTConference, HTEvent, HTPerson } from "@/types/db";

/** ---------- utilities ---------- */

function fmtTimeRange(
  begin: string | number | Date,
  end: string | number | Date,
  timeZone?: string
) {
  const b = new Date(begin);
  const e = new Date(end);
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(b);
  const t = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
  return `${date} • ${t.format(b)} – ${t.format(e)}`;
}

function getLocationName(
  loc?: { name?: string | null } | string | null
): string | null {
  if (!loc) return null;
  return typeof loc === "string" ? loc : (loc.name ?? null);
}

function isHttpUrl(url?: string | null): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function nonEmpty<T>(x: T | null | undefined): x is T {
  return x != null && x !== "";
}

/** ---------- component ---------- */

export default function PersonDetails({
  conference,
  person,
  events,
}: {
  conference: HTConference;
  person: HTPerson;
  events: HTEvent[];
  timeZone?: string;
}) {
  const links = useMemo(
    () =>
      (person.links ?? [])
        .filter((l) => isHttpUrl(l.url))
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [person.links]
  );

  const affiliations = useMemo(
    () =>
      (person.affiliations ?? []).filter(
        (a) => nonEmpty(a?.organization) || nonEmpty(a?.title)
      ),
    [person.affiliations]
  );

  const sortedEvents = useMemo(
    () =>
      (events ?? [])
        .slice()
        .sort(
          (a, b) => new Date(a.begin).getTime() - new Date(b.begin).getTime()
        ),
    [events]
  );

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8 text-gray-100">
      {/* Header card */}
      <section
        aria-labelledby="person-header"
        className="flex flex-col gap-6 rounded-2xl border border-gray-700 bg-gray-800 p-6 md:flex-row md:items-start"
      >
        {/* Name + affiliations + links */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1
              id="person-header"
              className="text-4xl font-extrabold leading-tight md:text-5xl"
            >
              {person.name}
            </h1>

            {/* Back to People */}
            <Link
              to={`/people?conf=${encodeURIComponent(conference.code)}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">People</span>
            </Link>
          </div>

          {affiliations.length > 0 && (
            <div className="space-y-1 text-gray-300">
              {affiliations.map((a, i) => {
                const org = a.organization?.trim();
                const title = a.title?.trim();
                return (
                  <p
                    key={`${org ?? "org"}-${title ?? "title"}-${i}`}
                    className="text-sm"
                  >
                    {title ? (
                      <span className="text-gray-200">{title}</span>
                    ) : null}
                    {title && org ? <span> @ </span> : null}
                    {org ? <span className="text-gray-200">{org}</span> : null}
                  </p>
                );
              })}
            </div>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {links.map((l) => (
                <a
                  key={`${l.url}-${l.title}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-indigo-400 underline-offset-4 hover:underline"
                >
                  <LinkIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">{l.title || l.url}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About (markdown-ready area; swap in your MD renderer as needed) */}
      {person.description ? (
        <section className="mt-10" aria-labelledby="about-title">
          <h2
            id="about-title"
            className="mb-3 text-2xl font-semibold text-gray-200"
          >
            About
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300">
            {/* Replace with your Markdown component if desired */}
            <p className="whitespace-pre-line">{person.description}</p>
          </div>
        </section>
      ) : null}

      {/* Events */}
      {sortedEvents.length > 0 ? (
        <section className="mt-10" aria-labelledby="events-title">
          <h2
            id="events-title"
            className="mb-4 text-2xl font-semibold text-gray-200"
          >
            Events
          </h2>
          <ul role="list" className="space-y-4">
            {sortedEvents.map((e) => {
              const when = fmtTimeRange(e.begin, e.end, conference.timezone);
              const where = getLocationName(e.location);
              const id = String(e.id);
              return (
                <li key={`${id}-${e.title}`}>
                  <Link
                    to={`/event?conf=${encodeURIComponent(conference.code)}&event=${encodeURIComponent(
                      id
                    )}`}
                    className="group block rounded-xl border border-gray-700 bg-gray-700/60 transition hover:bg-gray-600/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="flex flex-col gap-1 p-4">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {e.title}
                      </h3>
                      <p className="inline-flex items-center gap-2 text-sm text-gray-300">
                        <CalendarDaysIcon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        {when}
                      </p>
                      {where ? (
                        <p className="inline-flex items-center gap-2 text-sm text-gray-400">
                          <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                          {where}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
