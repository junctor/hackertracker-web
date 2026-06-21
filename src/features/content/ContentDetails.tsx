import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon as BookmarkOutline,
  CalendarDaysIcon,
  MapPinIcon,
  ShareIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import type {
  HTConference,
  HTContent,
  HTContentSession,
  HTLocation,
  HTPerson,
  HTTagGroup,
} from "@/types/db";

import Markdown from "@/components/Markdown";
import generateICal from "@/lib/utils/cal";
import { formatSessionTime } from "@/lib/utils/dates";
import { contentPath, personPath, schedulePath } from "@/lib/utils/routes";
import {
  getContentAccentColor,
  getContentDisplayTags,
  getContentPersonIds,
  sortScheduledContentByStart,
  toScheduledContent,
} from "@/lib/utils/schedule";
import { loadConfBookmarks, toggleBookmark } from "@/lib/utils/storage";

export default function ContentDetails({
  content,
  conference,
  people,
  tagGroups,
  locations,
}: {
  content: HTContent;
  conference: HTConference;
  people: HTPerson[];
  tagGroups: HTTagGroup[];
  locations: HTLocation[];
}) {
  const locale = undefined;
  const confCode = conference.code;

  const [bookmark, setBookmark] = useState<boolean>(() =>
    loadConfBookmarks(confCode).has(content.id),
  );
  const [bookmarkPulse, setBookmarkPulse] = useState(false);

  useEffect(() => {
    setBookmark(loadConfBookmarks(confCode).has(content.id));
  }, [confCode, content.id]);

  const sessions = useMemo(
    () => sortScheduledContentByStart(toScheduledContent(content)).map((item) => item.session),
    [content],
  );
  const locationById = useMemo(
    () => new Map(locations.map((location) => [location.id, location])),
    [locations],
  );
  const tags = useMemo(() => getContentDisplayTags(content, tagGroups), [content, tagGroups]);
  const visibleTags = tags.slice(0, 6);
  const hiddenTagCount = tags.length - visibleTags.length;
  const speakerNames = useMemo(
    () =>
      getContentPersonIds(content)
        .map((id) => people.find((person) => person.id === id)?.name)
        .filter((name): name is string => Boolean(name))
        .join(", "),
    [content, people],
  );

  const barStyle = useMemo(
    () =>
      ({
        "--content-color": getContentAccentColor(content, tagGroups) ?? "#9ca3af",
      }) as React.CSSProperties,
    [content, tagGroups],
  );

  const handleShare = async () => {
    const url = contentPath(confCode, content.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: content.title, url });
        return;
      }
    } catch {
      /* fall through */
    }
    await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
  };

  const handleCalendar = (session: HTContentSession) => {
    const locationName = locationById.get(session.location_id)?.name ?? null;
    const ics = generateICal(content, session, conference, {
      location: locationName,
      speakers: speakerNames || null,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `conf-${confCode}-event-${content.id}-${session.session_id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const handleBookmark = () => {
    setBookmark((b) => !b);
    setBookmarkPulse(true);
    window.setTimeout(() => setBookmarkPulse(false), 220);

    const fakeSetState: React.Dispatch<React.SetStateAction<Set<number>>> = (updater) => {
      const prev = loadConfBookmarks(confCode);
      return typeof updater === "function"
        ? (updater as (p: Set<number>) => Set<number>)(prev)
        : prev;
    };

    toggleBookmark(confCode, content.id, fakeSetState);
  };

  const bookmarkLabel = bookmark
    ? `Remove bookmark for ${content.title}`
    : `Add bookmark for ${content.title}`;

  return (
    <article
      role="article"
      aria-labelledby="content-title"
      className="ui-container ui-page-content relative max-w-5xl space-y-8 text-gray-100"
      style={barStyle}
    >
      <header className="ui-card relative overflow-hidden">
        <span aria-hidden="true" className="ui-accent-rail" />
        <span aria-hidden="true" className="ui-accent-rail-overlay" />

        <div className="relative z-10 flex flex-col gap-5 px-5 py-5 pl-6 sm:px-6 sm:py-6 sm:pl-7">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={schedulePath(confCode)}
              className="ui-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-gray-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100 focus-visible:outline-none"
            >
              <ArrowLeftIcon className="h-4.5 w-4.5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Schedule</span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
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
              id="content-title"
              className="text-3xl leading-tight font-extrabold tracking-tight md:text-4xl"
            >
              {content.title}
            </h1>

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

      {sessions.length > 0 && (
        <section aria-labelledby="sessions-title" className="space-y-4">
          <h2 id="sessions-title" className="ui-section-heading">
            Sessions
          </h2>
          <ul className="ui-list-stack-sm">
            {sessions.map((session) => {
              const begin = new Date(session.begin_tsz);
              const end = new Date(session.end_tsz);
              const locationName = locationById.get(session.location_id)?.name ?? null;
              const timeZone = session.timezone_name || conference.timezone || "UTC";

              return (
                <li key={session.session_id} className="ui-card px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2 text-gray-300">
                      <p className="text-lg font-medium text-gray-100">
                        <time dateTime={begin.toISOString()}>
                          {formatSessionTime(begin, end, timeZone, locale)}
                        </time>
                      </p>

                      {locationName ? (
                        <p className="flex min-w-0 items-center gap-2 text-sm">
                          <MapPinIcon
                            className="h-5 w-5 shrink-0 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="truncate">{locationName}</span>
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCalendar(session)}
                      className="ui-icon-btn ui-focus-ring h-11 w-11 shrink-0 self-start focus-visible:outline-none"
                      title="Add session to calendar"
                      aria-label="Add session to calendar"
                    >
                      <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {content.description && (
        <section aria-labelledby="description-title" className="space-y-4">
          <h2 id="description-title" className="ui-section-heading">
            Description
          </h2>
          <div className="ui-card px-5 py-5 sm:px-6">
            <div className="prose prose-invert prose-p:leading-7 max-w-none text-gray-300">
              <Markdown content={content.description} />
            </div>
          </div>
        </section>
      )}

      {content.links.length > 0 && (
        <section aria-labelledby="links-title" className="space-y-4">
          <h2 id="links-title" className="ui-section-heading">
            Links
          </h2>
          <ul className="ui-list-stack-sm">
            {content.links.map((l) => (
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

      {content.media.length > 0 && (
        <section aria-labelledby="media-title" className="space-y-4">
          <h2 id="media-title" className="ui-section-heading">
            Media
          </h2>
          <ul className="ui-list-stack-sm">
            {content.media.map((media) => (
              <li key={`${media.name}-${media.url}`}>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-card ui-card-interactive ui-focus-ring group flex min-w-0 items-center justify-between gap-4 px-4 py-3.5 focus-visible:outline-none sm:px-5"
                >
                  <span className="truncate text-sm font-medium text-[#6CCDBB] transition-colors group-hover:text-white sm:text-[0.95rem]">
                    {media.name}
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

      {content.related_content_ids && content.related_content_ids.length > 0 && (
        <section aria-labelledby="related-title" className="space-y-4">
          <h2 id="related-title" className="ui-section-heading">
            Related
          </h2>
          <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {content.related_content_ids.map((relatedContentId) => (
              <li key={relatedContentId}>
                <Link
                  to={contentPath(confCode, relatedContentId)}
                  className="ui-pill-link ui-focus-ring focus-visible:outline-none"
                >
                  Content {relatedContentId}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {people.length > 0 && (
        <section aria-labelledby="people-title" className="space-y-3">
          <h2 id="people-title" className="ui-section-heading">
            People
          </h2>
          <div className="ui-card px-4 py-4 sm:px-5">
            <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              {people.map((p) => (
                <li key={p.id}>
                  <Link
                    to={personPath(confCode, p.id)}
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
