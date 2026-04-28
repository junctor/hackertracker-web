import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router";

import type { HTConference, HTEvent, HTPerson } from "@/types/db";

import Markdown from "@/components/Markdown";

const PERSON_ACCENT_COLORS = ["#017FA4", "#2D7FF9", "#0F766E", "#7C3AED", "#C2410C", "#0E7490"];

type AvatarRecord = {
  avatar?: { url?: string | null } | string | null;
  avatarUrl?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  name?: string | null;
};

function fmtTimeRange(
  begin: string | number | Date,
  end: string | number | Date,
  timeZone?: string,
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

function getLocationName(loc?: { name?: string | null } | string | null): string | null {
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

function getTrimmedText(value?: string | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getPersonName(name?: string | null): string {
  return getTrimmedText(name).replace(/\s+/g, " ");
}

function getDisplayName(name?: string | null): string {
  return getPersonName(name) || "Unknown person";
}

function getOptionalText(value?: string | null): string | null {
  return getTrimmedText(value) || null;
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
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const personName = getDisplayName(person.name);
  const personInitials = getInitials(person.name);
  const personAvatarUrl = getPersonAvatarUrl(person);
  const personPronouns = getOptionalText(person.pronouns);
  const personDescription = getOptionalText(person.description);
  const accentColor = getPersonAccent(person.name);

  const sortedEvents = useMemo(
    () =>
      (events ?? [])
        .slice()
        .sort((a, b) => new Date(a.begin).getTime() - new Date(b.begin).getTime()),
    [events],
  );
  const primaryEventColor = sortedEvents.find((event) => event.type?.color)?.type.color;
  const headerStyle = {
    "--event-color": primaryEventColor ?? accentColor,
  } as CSSProperties;
  const avatarStyle = {
    backgroundImage: `linear-gradient(135deg, ${accentColor}22 0%, rgba(15, 23, 42, 0.92) 100%)`,
  } as CSSProperties;

  const links = useMemo(
    () =>
      (person.links ?? [])
        .filter((link) => isHttpUrl(link.url))
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [person.links],
  );

  const affiliations = useMemo(
    () =>
      (person.affiliations ?? [])
        .map((affiliation) => ({
          organization: getOptionalText(affiliation.organization),
          title: getOptionalText(affiliation.title),
        }))
        .filter((affiliation) => affiliation.organization || affiliation.title),
    [person.affiliations],
  );

  useEffect(() => {
    setHasAvatarError(false);
  }, [personAvatarUrl]);

  return (
    <div className="mx-auto max-w-screen-lg space-y-10 px-4 py-8 text-gray-100">
      <header
        style={headerStyle}
        aria-labelledby="person-header"
        className="ui-card relative overflow-hidden"
      >
        <span aria-hidden="true" className="ui-accent-rail" />
        <span aria-hidden="true" className="ui-accent-rail-overlay" />

        <div className="relative z-10 flex flex-col gap-6 px-5 py-5 pl-6 sm:px-6 sm:py-6 sm:pl-7">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/people?conf=${encodeURIComponent(conference.code)}`}
              className="ui-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-gray-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100 focus:outline-none"
            >
              <ArrowLeftIcon className="h-4.5 w-4.5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">People</span>
            </Link>
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div
              style={avatarStyle}
              className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/4 text-2xl font-semibold tracking-[0.08em] text-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:h-28 sm:w-28 sm:text-3xl"
            >
              {personAvatarUrl && !hasAvatarError ? (
                <img
                  src={personAvatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setHasAvatarError(true)}
                />
              ) : (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_62%)]"
                  />
                  {personInitials ? (
                    <span className="relative">{personInitials}</span>
                  ) : (
                    <UserIcon
                      className="relative h-8 w-8 text-gray-100 sm:h-10 sm:w-10"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    id="person-header"
                    className="text-3xl leading-tight font-extrabold md:text-4xl"
                  >
                    {personName}
                  </h1>
                  {personPronouns ? (
                    <span className="inline-flex items-center rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-xs font-medium text-gray-200">
                      {personPronouns}
                    </span>
                  ) : null}
                </div>

                {affiliations.length > 0 ? (
                  <ul className="m-0 list-none space-y-1.5 p-0 text-sm leading-6 text-gray-300">
                    {affiliations.map((affiliation, i) => (
                      <li
                        key={`${affiliation.organization ?? "organization"}:${affiliation.title ?? "title"}:${i}`}
                      >
                        {affiliation.title ? (
                          <span className="font-semibold text-gray-100">{affiliation.title}</span>
                        ) : null}
                        {affiliation.title && affiliation.organization ? (
                          <span className="mx-2 text-gray-500">@</span>
                        ) : null}
                        {affiliation.organization ? <span>{affiliation.organization}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {links.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
                  {links.map((link) => (
                    <li key={`${link.url}-${link.title}`}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ui-focus-ring ui-pill-link focus:outline-none"
                      >
                        <span className="max-w-[16rem] truncate">{link.title || link.url}</span>
                        <ArrowTopRightOnSquareIcon
                          className="h-4 w-4 shrink-0 text-[#6CCDBB]"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {personDescription ? (
        <section aria-labelledby="about-title" className="space-y-4">
          <h2 id="about-title" className="text-sm font-semibold tracking-[0.02em] text-gray-300">
            About
          </h2>
          <div className="ui-card px-5 py-5 sm:px-6">
            <div className="prose prose-invert prose-p:leading-7 max-w-none text-gray-300">
              <Markdown content={personDescription} />
            </div>
          </div>
        </section>
      ) : null}

      {sortedEvents.length > 0 ? (
        <section aria-labelledby="events-title" className="space-y-4">
          <h2 id="events-title" className="text-sm font-semibold tracking-[0.02em] text-gray-300">
            Sessions
          </h2>
          <ul role="list" className="space-y-4">
            {sortedEvents.map((event) => {
              const when = fmtTimeRange(event.begin, event.end, conference.timezone);
              const where = getLocationName(event.location);
              const id = String(event.id);
              const eventStyle = {
                "--event-color": event.type?.color ?? primaryEventColor ?? accentColor,
              } as CSSProperties;

              return (
                <li
                  key={`${id}-${event.title}`}
                  className="ui-card ui-card-interactive group relative overflow-hidden"
                  style={eventStyle}
                >
                  <span aria-hidden="true" className="ui-accent-rail" />
                  <span aria-hidden="true" className="ui-accent-rail-overlay" />
                  <Link
                    to={`/event?conf=${encodeURIComponent(conference.code)}&event=${encodeURIComponent(
                      id,
                    )}`}
                    className="ui-focus-ring relative z-10 block rounded-[inherit] px-4 py-4 pl-5 focus:outline-none sm:px-5 sm:py-5 sm:pl-6"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <h3 className="line-clamp-2 text-base leading-6 font-semibold text-gray-100 transition-colors group-hover:text-white sm:text-lg">
                        {event.title}
                      </h3>
                      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-100 sm:text-base">
                        <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <time dateTime={new Date(event.begin).toISOString()}>{when}</time>
                      </div>
                      {where ? (
                        <div className="flex min-w-0 items-center gap-2 text-sm text-gray-400">
                          <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="truncate">{where}</span>
                        </div>
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
