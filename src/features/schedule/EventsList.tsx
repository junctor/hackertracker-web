import {
  BookmarkIcon,
  // TagIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { NavLink } from "react-router";

import type { HTConference } from "@/types/db";
import type { GroupedSchedule } from "@/types/ht";

import { fmtHeading, fmtTab } from "@/lib/utils/schedule";
import { loadConfBookmarks, toggleBookmark } from "@/lib/utils/storage";

import EventItem from "./EventItem";

export default function EventsList({
  dateGroup,
  conf,
  pageTitle,
}: {
  dateGroup: GroupedSchedule;
  conf: HTConference;
  pageTitle: string;
}) {
  const TAB_TOP = 60;
  const TAB_HEIGHT = 56;
  const SCROLL_OFFSET = TAB_TOP + TAB_HEIGHT;

  const confCode = conf.code;
  const nowSeconds = useMemo(() => Math.floor(Date.now() / 1000), []);

  const days = useMemo(
    () => Object.entries(dateGroup).map(([day, events]) => ({ day, events })),
    [dateGroup],
  );

  const [activeDays, setActiveDays] = useState<string[]>([]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  const makeToggle = useCallback(
    (id: number) => () => toggleBookmark(confCode, id, setBookmarks),
    [confCode],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBookmarks(loadConfBookmarks(confCode));
  }, [confCode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const day = entry.target.getAttribute("data-day")!;
          setActiveDays((prev) =>
            entry.isIntersecting ? [...new Set([...prev, day])] : prev.filter((d) => d !== day),
          );
        });
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px 0px 0px`, threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [days, SCROLL_OFFSET]);

  const scrollToDay = useCallback(
    (day: string) => {
      const el = sectionRefs.current[day];
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    },
    [SCROLL_OFFSET],
  );

  return (
    <div className="min-h-screen text-gray-100">
      <div className="sticky top-0 z-40 border-b border-white/8 bg-gray-950/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <h1 className="min-w-0 truncate text-lg font-bold tracking-tight text-gray-100 sm:text-xl">
            {pageTitle}
          </h1>

          <nav aria-label="Schedule tools" className="shrink-0">
            {pageTitle === "Schedule" && (
              <NavLink
                to={`/bookmarks?conf=${confCode}`}
                className={({ isActive }) =>
                  [
                    "ui-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                    isActive
                      ? "border-[#017FA4]/28 bg-[#0D294A]/42 text-white"
                      : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100",
                  ].join(" ")
                }
                aria-label="View bookmarked events"
              >
                <BookmarkIcon className="h-4.5 w-4.5" aria-hidden="true" />
                <span className="hidden sm:inline">Bookmarks</span>
              </NavLink>
            )}

            {pageTitle === "Bookmarks" && (
              <NavLink
                to={`/schedule?conf=${confCode}`}
                className={({ isActive }) =>
                  [
                    "ui-focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                    isActive
                      ? "border-[#017FA4]/28 bg-[#0D294A]/42 text-white"
                      : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100",
                  ].join(" ")
                }
                aria-label="Schedule"
              >
                <CalendarIcon className="h-4.5 w-4.5" aria-hidden="true" />
                <span className="hidden sm:inline">Schedule</span>
              </NavLink>
            )}

            {/* <NavLink
            to="/tags"
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                isActive
                  ? "bg-gray-800"
                  : "border border-gray-700 hover:bg-gray-900",
              ].join(" ")
            }
            aria-label="Filter by tags"
          >
            <TagIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Tags</span>
          </NavLink> */}
          </nav>
        </div>
      </div>

      <div className="sticky top-14 z-30 border-b border-white/8 bg-gray-950/92 py-2 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max justify-center gap-2">
            {days.map(({ day, events }) => {
              const active = activeDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => scrollToDay(day)}
                  aria-current={active ? "date" : undefined}
                  aria-label={`${fmtTab(day, conf.timezone || "UTC")}, ${events.length} ${
                    events.length === 1 ? "event" : "events"
                  }`}
                  className={[
                    "ui-focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm whitespace-nowrap transition",
                    active
                      ? "border-[#017FA4]/30 bg-[#0D294A]/58 text-white"
                      : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100",
                  ].join(" ")}
                >
                  <span className="font-semibold">{fmtTab(day, conf.timezone || "UTC")}</span>
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      active
                        ? "border-[#017FA4]/26 bg-[#017FA4]/12 text-[#9FE4D7]"
                        : "border-white/8 bg-black/15 text-gray-400 group-hover:text-gray-200",
                    ].join(" ")}
                  >
                    {events.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-5">
          <div className="ui-empty-state">
            <p className="text-gray-200">No events are available.</p>
          </div>
        </div>
      ) : (
        days.map(({ day, events }) => (
          <section
            key={day}
            ref={(el) => {
              sectionRefs.current[day] = el as HTMLDivElement | null;
            }}
            data-day={day}
            className="mx-auto max-w-7xl px-4 sm:px-5"
          >
            <div className="mt-5 mb-3 flex flex-col gap-3 border-b border-white/8 pb-3.5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="ml-1 scroll-mt-[116px] text-xl font-bold tracking-tight text-gray-100 md:text-2xl">
                {fmtHeading(day, conf.timezone || "UTC")}
              </h2>
              <p className="inline-flex items-center self-start rounded-full border border-white/8 bg-white/3 px-3 py-1 text-sm font-medium text-gray-300 sm:self-auto">
                {events.length} {events.length === 1 ? "event" : "events"}
              </p>
            </div>
            <ul role="list" className="mb-8 grid gap-3">
              {events.map((evt) => (
                <EventItem
                  key={evt.id}
                  event={evt}
                  confCode={confCode}
                  isBookmarked={bookmarks.has(evt.id)}
                  nowSeconds={nowSeconds}
                  onToggle={makeToggle(evt.id)}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
