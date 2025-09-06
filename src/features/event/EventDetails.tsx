import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  BookmarkIcon as BookmarkOutline,
  ArrowLeftIcon,
  CalendarDaysIcon,
  ShareIcon,
  MapPinIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import type { ProcessedEvent } from "@/types/ht";
import { loadConfBookmarks, toggleBookmark } from "@/lib/utils/storage";
import { generateICalFromProcessed } from "@/lib/utils/cal";
import { formatSessionTime } from "@/lib/utils/dates";
import type { HTConference, HTPerson } from "@/types/db";
import Markdown from "@/components/Markdown";

export default function EventDetails({
  event,
  conference,
  people,
}: {
  event: ProcessedEvent;
  conference: HTConference;
  people: HTPerson[];
}) {
  const nav = useNavigate();
  const zone = event.timeZone;
  const locale = undefined;
  const confCode = conference.code;
  const backLink = `/schedule?conf=${confCode}`;

  const [bookmark, setBookmark] = useState<boolean>(() =>
    loadConfBookmarks(confCode).has(event.id)
  );
  const [bookmarkPulse, setBookmarkPulse] = useState(false);

  useEffect(() => {
    setBookmark(loadConfBookmarks(confCode).has(event.id));
  }, [confCode, event.id]);

  const barStyle = useMemo(
    () =>
      ({ "--event-color": event.color ?? "#9ca3af" }) as React.CSSProperties,
    [event.color]
  );

  const handleBack = () => {
    if (backLink) nav(backLink);
    else nav(-1);
  };

  const handleShare = async () => {
    const url = `/event?conf=${confCode}&event=${event.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
        return;
      }
    } catch {
      /* fall through */
    }
    await navigator.clipboard.writeText(
      new URL(url, window.location.origin).toString()
    );
  };

  const handleCalendar = () => {
    const ics = generateICalFromProcessed(event, conference);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `conf-${confCode}-event-${event.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const handleBookmark = () => {
    // optimistic UI
    setBookmark((b) => !b);
    setBookmarkPulse(true);
    window.setTimeout(() => setBookmarkPulse(false), 220);

    // toggleBookmark requires a setState signature; provide a no-op that returns the prior Set
    const fakeSetState: React.Dispatch<React.SetStateAction<Set<number>>> = (
      updater
    ) => {
      const prev = loadConfBookmarks(confCode);
      return typeof updater === "function"
        ? (updater as (p: Set<number>) => Set<number>)(prev)
        : prev;
    };

    toggleBookmark(confCode, event.id, fakeSetState);
  };

  const begin = new Date(event.begin);
  const end = new Date(event.end ?? event.begin);

  return (
    <article
      role="article"
      aria-labelledby="event-title"
      className="relative mx-auto max-w-3xl px-4 py-6 text-gray-100"
      style={barStyle}
    >
      {/* Header actions */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700/70 bg-gray-900/20 px-3 py-2 text-sm transition-colors duration-200 hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCalendar}
            className="rounded-lg border border-gray-700/70 bg-gray-900/20 p-2 transition-colors duration-200 hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            title="Add to calendar"
            aria-label="Add to calendar"
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={handleShare}
              className="rounded-lg border border-gray-700/70 bg-gray-900/20 p-2 transition-colors duration-200 hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              title="Share"
              aria-label="Share"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={handleBookmark}
            aria-pressed={bookmark}
            aria-label={bookmark ? "Remove bookmark" : "Add bookmark"}
            className={[
              "relative rounded-lg border border-gray-700/70 bg-gray-900/20 p-2 transition-transform duration-200 hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
              bookmarkPulse ? "scale-110" : "",
            ].join(" ")}
            title={bookmark ? "Bookmarked" : "Bookmark"}
          >
            {bookmark ? (
              <BookmarkSolid className="h-5 w-5 text-indigo-400" />
            ) : (
              <BookmarkOutline className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Event identity */}
      <div className="relative pl-5">
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-[clamp(0.3rem,2vw,0.9rem)] rounded-r-md bg-gradient-to-b from-[var(--event-color)] to-indigo-600/40"
        />

        <div className="ml-1">
          {/* Title */}
          <h1
            id="event-title"
            className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight"
          >
            {event.title}
          </h1>

          {/* Meta */}
          <div className="mt-3 space-y-2 text-gray-300">
            <div className="text-lg font-medium">
              {formatSessionTime(begin, end, zone, locale)}
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="h-5 w-5 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ring-white/10 shadow-sm"
                  style={{
                    backgroundColor:
                      tag.color_background ?? "rgba(255,255,255,0.06)",
                    color: tag.color_foreground ?? "#fff",
                  }}
                  title={tag.label}
                >
                  <span className="inline-block max-w-[12rem] truncate align-middle">
                    {tag.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <section className="mt-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-200">
            Description
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300">
            <Markdown content={event.description} />
          </div>
        </section>
      )}

      {/* Links */}
      {event.links.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-200">Links</h2>
          <ul className="space-y-2">
            {event.links.map((l) => (
              <li key={l.url} className="group">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 underline-offset-2 decoration-indigo-500/40 transition-colors duration-200 group-hover:decoration-indigo-400 text-indigo-300 group-hover:text-indigo-200"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* People */}
      {people.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-200">People</h2>
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <Link
                key={p.id}
                to={`/person?conf=${confCode}&person=${p.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-gray-800/50 px-3 py-1 text-sm text-gray-200 ring-1 ring-white/10 transition-colors duration-200 hover:bg-indigo-600/50"
                title={p.name}
              >
                <span className="inline-grid size-6 place-items-center rounded-full bg-gray-700/80 text-[10px] font-semibold">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <UserIcon className="h-4 w-4 text-indigo-300" />
                <span className="truncate max-w-[12rem]">{p.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
