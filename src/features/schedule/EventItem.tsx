import React, { useMemo, useState, useEffect, memo } from "react";
import { useNavigate } from "react-router";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import type { ProcessedEvent } from "@/types/ht";

function fmtTime(value: string | number | Date, tz?: string, withZone = false) {
  const d = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
    ...(withZone ? { timeZoneName: "short" } : {}),
  }).format(d);
}

function EventItemBase({
  event,
  isBookmarked,
  confCode,
  onToggle,
}: {
  event: ProcessedEvent;
  isBookmarked: boolean;
  confCode: string;
  onToggle?: () => void;
}) {
  const nav = useNavigate();

  const [optimistic, setOptimistic] = useState(isBookmarked);
  useEffect(() => setOptimistic(isBookmarked), [isBookmarked]);

  const barStyle = useMemo(
    () => ({ "--event-color": event.color ?? "#fff" }) as React.CSSProperties,
    [event.color]
  );

  const go = () => nav(`/event?conf=${confCode}&event=${event.id}`);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptimistic((v) => !v);
    onToggle?.();
  };

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go()}
      className="group relative cursor-pointer rounded-xl border border-gray-800 bg-gray-900/40 p-3 transition-colors hover:bg-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      style={barStyle}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-2 bottom-2 w-[clamp(0.25rem,2vw,0.75rem)] rounded-r-md bg-[var(--event-color)] transition-all duration-200 group-hover:w-[clamp(0.35rem,3vw,1rem)]"
      />
      <div className="ml-3 grid grid-cols-12 gap-2">
        <div className="col-span-12 sm:col-span-3">
          <p className="text-base font-semibold text-gray-100">
            <time dateTime={new Date(event.begin).toISOString()}>
              {fmtTime(event.begin, event.timeZone, true)}
            </time>
          </p>
          {event.end && (
            <p className="text-sm text-gray-400">
              {fmtTime(event.end, event.timeZone, false)} {/* no zone here */}
            </p>
          )}
        </div>

        <div className="col-span-12 sm:col-span-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-100 line-clamp-2">
            {event.title}
          </h3>
          {event.speakers && (
            <p className="mt-1 italic text-gray-300">{event.speakers}</p>
          )}
          {event.location && (
            <p className="mt-1 text-gray-300">{event.location}</p>
          )}
          {event.tags?.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide"
                  style={{
                    backgroundColor:
                      tag.color_background ?? "rgba(255,255,255,0.1)",
                    color: tag.color_foreground ?? "#fff",
                  }}
                >
                  {tag.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-span-12 sm:col-span-1 flex items-start justify-end">
          <button
            onClick={toggle}
            aria-label={optimistic ? "Remove bookmark" : "Add bookmark"}
            aria-pressed={optimistic}
            className="rounded p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {optimistic ? (
              <BookmarkSolid className="h-5 w-5 text-indigo-400" />
            ) : (
              <BookmarkOutline className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </li>
  );
}

const EventItem = memo(
  EventItemBase,
  (prev, next) =>
    prev.event.id === next.event.id &&
    prev.isBookmarked === next.isBookmarked &&
    prev.confCode === next.confCode
);

export default EventItem;
