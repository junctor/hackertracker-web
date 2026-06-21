import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import React, { useMemo, useState, useEffect, memo } from "react";
import { Link } from "react-router";

import type { ProcessedScheduledContent } from "@/types/ht";

import { contentPath } from "@/lib/utils/routes";

function fmtTime(value: string | number | Date, tz?: string, withZone = false) {
  const d = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
    ...(withZone ? { timeZoneName: "short" } : {}),
  }).format(d);
}

function ScheduleContentItemBase({
  scheduledContent,
  isBookmarked,
  confCode,
  nowSeconds,
  onToggle,
}: {
  scheduledContent: ProcessedScheduledContent;
  isBookmarked: boolean;
  confCode: string;
  nowSeconds: number;
  onToggle?: () => void;
}) {
  const [optimistic, setOptimistic] = useState(isBookmarked);
  useEffect(() => setOptimistic(isBookmarked), [isBookmarked]);

  const barStyle = useMemo(
    () => ({ "--content-color": scheduledContent.color ?? "#64748b" }) as React.CSSProperties,
    [scheduledContent.color],
  );

  const href = contentPath(confCode, scheduledContent.contentId);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimistic((v) => !v);
    onToggle?.();
  };

  const beginTimestampSeconds =
    scheduledContent.beginTimestampSeconds ??
    Math.floor(new Date(scheduledContent.begin).getTime() / 1000);
  const endTimestampSeconds =
    scheduledContent.endTimestampSeconds ??
    (scheduledContent.end
      ? Math.floor(new Date(scheduledContent.end).getTime() / 1000)
      : beginTimestampSeconds);
  const isLive = beginTimestampSeconds <= nowSeconds && nowSeconds < endTimestampSeconds;
  const isNext =
    !isLive && beginTimestampSeconds > nowSeconds && beginTimestampSeconds - nowSeconds <= 30 * 60;
  const visibleTags = scheduledContent.tags.slice(0, 4);
  const hiddenTagCount = scheduledContent.tags.length - visibleTags.length;
  const bookmarkLabel = optimistic
    ? `Remove bookmark for ${scheduledContent.title}`
    : `Add bookmark for ${scheduledContent.title}`;

  return (
    <article
      className="ui-card ui-card-interactive group relative w-full min-w-0 overflow-hidden"
      style={barStyle}
    >
      <span aria-hidden="true" className="ui-accent-rail" />
      <span aria-hidden="true" className="ui-accent-rail-overlay" />

      <div className="relative z-10 flex items-start gap-3 px-4 py-4 pl-5 sm:px-5 sm:py-5 sm:pl-6">
        <Link
          to={href}
          className="ui-focus-ring min-w-0 flex-1 rounded-[inherit] focus-visible:outline-none"
        >
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:gap-5">
            <div className="min-w-0 space-y-1.5 md:w-44 md:shrink-0">
              {(isLive || isNext) && (
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${
                    isLive
                      ? "border-[#E0004E] bg-[#E0004E]/16 text-[#ffb4c9]"
                      : "border-[#F1B435]/75 bg-[#F1B435]/16 text-[#F1B435]"
                  }`}
                >
                  {isLive ? "Live" : "Next"}
                </span>
              )}
              <p className="text-sm font-semibold text-gray-100 sm:text-base">
                <time dateTime={new Date(scheduledContent.begin).toISOString()}>
                  {fmtTime(scheduledContent.begin, scheduledContent.timeZone, true)}
                </time>
              </p>
              {scheduledContent.end && (
                <p className="text-sm text-gray-400">
                  <time dateTime={new Date(scheduledContent.end).toISOString()}>
                    {fmtTime(scheduledContent.end, scheduledContent.timeZone, false)}
                  </time>
                </p>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="line-clamp-2 text-lg leading-7 font-semibold text-gray-100 transition-colors group-hover:text-white sm:text-xl">
                {scheduledContent.title}
              </h3>
              {scheduledContent.speakers && (
                <p className="line-clamp-2 text-sm text-gray-300 italic">
                  {scheduledContent.speakers}
                </p>
              )}
              {scheduledContent.location && (
                <p className="line-clamp-1 text-sm text-gray-300/90">{scheduledContent.location}</p>
              )}
              {visibleTags.length > 0 && (
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {visibleTags.map((tag) => (
                    <li
                      key={tag.id}
                      className="ui-tag-chip ui-tag-chip-strong"
                      style={{
                        backgroundColor: tag.color_background ?? "rgba(255,255,255,0.08)",
                        color: tag.color_foreground ?? "#fff",
                      }}
                    >
                      {tag.label}
                    </li>
                  ))}
                  {hiddenTagCount > 0 && (
                    <li className="ui-tag-chip bg-white/3 text-gray-300">+{hiddenTagCount} more</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label={bookmarkLabel}
          aria-pressed={optimistic}
          className="ui-icon-btn ui-focus-ring h-11 w-11 shrink-0 focus-visible:outline-none"
        >
          {optimistic ? (
            <BookmarkSolid className="h-5 w-5" aria-hidden="true" />
          ) : (
            <BookmarkOutline className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </article>
  );
}

const ScheduleContentItem = memo(
  ScheduleContentItemBase,
  (prev, next) =>
    prev.scheduledContent.contentId === next.scheduledContent.contentId &&
    prev.scheduledContent.sessionId === next.scheduledContent.sessionId &&
    prev.isBookmarked === next.isBookmarked &&
    prev.confCode === next.confCode &&
    prev.nowSeconds === next.nowSeconds,
);

export default ScheduleContentItem;
