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
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router";

import type { HTConference, HTPerson } from "@/types/db";
import type { ProcessedEvent } from "@/types/ht";

import Markdown from "@/components/Markdown";
import generateICal from "@/lib/utils/cal";
import { formatSessionTime } from "@/lib/utils/dates";
import { loadConfBookmarks, toggleBookmark } from "@/lib/utils/storage";

export default function EventDetails({
  event,
  conference,
  people,
}: {
  event: ProcessedEvent;
  conference: HTConference;
  people: HTPerson[];
}) {
  const zone = event.timeZone;
  const locale = undefined;
  const confCode = conference.code;

  const [bookmark, setBookmark] = useState<boolean>(() =>
    loadConfBookmarks(confCode).has(event.id),
  );
  const [bookmarkPulse, setBookmarkPulse] = useState(false);

  useEffect(() => {
    setBookmark(loadConfBookmarks(confCode).has(event.id));
  }, [confCode, event.id]);

  const barStyle = useMemo(
    () => ({ "--event-color": event.color ?? "#9ca3af" }) as React.CSSProperties,
    [event.color],
  );

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
    await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
  };

  const handleCalendar = () => {
    const ics = generateICal(event, conference);
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
    const fakeSetState: React.Dispatch<React.SetStateAction<Set<number>>> = (updater) => {
      const prev = loadConfBookmarks(confCode);
      return typeof updater === "function"
        ? (updater as (p: Set<number>) => Set<number>)(prev)
        : prev;
    };

    toggleBookmark(confCode, event.id, fakeSetState);
  };

  const begin = new Date(event.begin);
  const end = new Date(event.end ?? event.begin);
  const visibleTags = event.tags.slice(0, 6);
  const hiddenTagCount = event.tags.length - visibleTags.length;
  const bookmarkLabel = bookmark
    ? `Remove bookmark for ${event.title}`
    : `Add bookmark for ${event.title}`;

  return (
    <article
      role="article"
      aria-labelledby="event-title"
      className="relative mx-auto max-w-3xl space-y-8 px-4 py-6 text-gray-100 sm:py-8"
      style={barStyle}
    >
      <header className="ui-card relative overflow-hidden">
        <span aria-hidden="true" className="ui-accent-rail" />
        <span aria-hidden="true" className="ui-accent-rail-overlay" />

        <div className="relative z-10 flex flex-col gap-5 px-5 py-5 pl-6 sm:px-6 sm:py-6 sm:pl-7">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/schedule?conf=${encodeURIComponent(confCode)}`}
              className="ui-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-gray-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100 focus-visible:outline-none"
            >
              <ArrowLeftIcon className="h-4.5 w-4.5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Schedule</span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleCalendar}
                className="ui-icon-btn ui-focus-ring h-11 w-11 focus-visible:outline-none"
                title="Add to calendar"
                aria-label="Add to calendar"
              >
                <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="ui-icon-btn ui-focus-ring h-11 w-11 focus-visible:outline-none"
                title="Share"
                aria-label="Share event link"
              >
                <ShareIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleBookmark}
                aria-pressed={bookmark}
                aria-label={bookmarkLabel}
                className={[
                  "ui-icon-btn ui-focus-ring h-11 w-11",
                  bookmarkPulse ? "scale-110" : "",
                  "focus-visible:outline-none",
                ].join(" ")}
                title={bookmark ? "Bookmarked" : "Bookmark"}
              >
                {bookmark ? (
                  <BookmarkSolid className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <BookmarkOutline className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h1
              id="event-title"
              className="text-3xl leading-tight font-extrabold tracking-tight md:text-4xl"
            >
              {event.title}
            </h1>

            <div className="space-y-2 text-gray-300">
              <p className="text-lg font-medium">
                <time dateTime={begin.toISOString()}>
                  {formatSessionTime(begin, end, zone, locale)}
                </time>
              </p>

              {event.location && (
                <p className="flex min-w-0 items-center gap-2 text-sm">
                  <MapPinIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
                  <span className="truncate">{event.location}</span>
                </p>
              )}
            </div>

            {visibleTags.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {visibleTags.map((tag) => (
                  <li
                    key={tag.id}
                    className="ui-tag-chip"
                    style={{
                      backgroundColor: tag.color_background ?? "rgba(255,255,255,0.08)",
                      color: tag.color_foreground ?? "#fff",
                    }}
                    title={tag.label}
                  >
                    <span className="max-w-[12rem] truncate">{tag.label}</span>
                  </li>
                ))}
                {hiddenTagCount > 0 && (
                  <li className="ui-tag-chip bg-white/3 text-gray-300">+{hiddenTagCount} more</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </header>

      {event.description && (
        <section aria-labelledby="description-title" className="space-y-4">
          <h2
            id="description-title"
            className="text-sm font-semibold tracking-[0.02em] text-gray-300"
          >
            Description
          </h2>
          <div className="ui-card px-5 py-5 sm:px-6">
            <div className="prose prose-invert prose-p:leading-7 max-w-none text-gray-300">
              <Markdown content={event.description} />
            </div>
          </div>
        </section>
      )}

      {event.links.length > 0 && (
        <section aria-labelledby="links-title" className="space-y-4">
          <h2 id="links-title" className="text-sm font-semibold tracking-[0.02em] text-gray-300">
            Links
          </h2>
          <ul className="space-y-2.5">
            {event.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-card ui-card-interactive ui-focus-ring group flex min-w-0 items-center justify-between gap-4 px-4 py-3.5 focus-visible:outline-none sm:px-5"
                >
                  <span className="truncate text-sm font-medium text-[#6CCDBB] transition-colors group-hover:text-white sm:text-[0.95rem]">
                    {l.label}
                  </span>
                  <ArrowTopRightOnSquareIcon
                    className="h-4 w-4 shrink-0 text-[#6CCDBB] transition-colors group-hover:text-white"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {people.length > 0 && (
        <section aria-labelledby="people-title" className="space-y-3">
          <h2 id="people-title" className="text-sm font-semibold tracking-[0.02em] text-gray-300">
            People
          </h2>
          <div className="ui-card px-4 py-4 sm:px-5">
            <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              {people.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/person?conf=${confCode}&person=${p.id}`}
                    className="ui-pill-link ui-focus-ring focus-visible:outline-none"
                    title={p.name}
                  >
                    <UserIcon className="h-4 w-4 text-[#6CCDBB]" aria-hidden="true" />
                    <span className="max-w-[12rem] truncate">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
