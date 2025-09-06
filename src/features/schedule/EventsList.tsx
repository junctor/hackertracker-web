import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { NavLink } from "react-router";
import {
  BookmarkIcon,
  // TagIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import EventItem from "./EventItem";
import type { GroupedSchedule } from "@/types/ht";
import { loadConfBookmarks, toggleBookmark } from "@/lib/utils/storage";

const fmtTab = (day: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(day));

const fmtHeading = (day: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(day));

export default function EventsList({
  dateGroup,
  confCode,
  pageTitle,
}: {
  dateGroup: GroupedSchedule;
  confCode: string;
  pageTitle: string;
}) {
  const TAB_TOP = 60;
  const TAB_HEIGHT = 56;
  const SCROLL_OFFSET = TAB_TOP + TAB_HEIGHT;

  const days = useMemo(
    () => Object.entries(dateGroup).map(([day, events]) => ({ day, events })),
    [dateGroup]
  );

  const [activeDays, setActiveDays] = useState<string[]>([]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  const makeToggle = useCallback(
    (id: number) => () => toggleBookmark(confCode, id, setBookmarks),
    [confCode]
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
            entry.isIntersecting
              ? [...new Set([...prev, day])]
              : prev.filter((d) => d !== day)
          );
        });
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px 0px 0px`, threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el)
    );
    return () => observer.disconnect();
  }, [days, SCROLL_OFFSET]);

  const scrollToDay = useCallback(
    (day: string) => {
      const el = sectionRefs.current[day];
      if (!el) return;
      const top =
        el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [SCROLL_OFFSET]
  );

  return (
    <div className="min-h-screen text-gray-100">
      {/* Top toolbar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-700 bg-gray-950/80 p-2 backdrop-blur">
        {/* Left side */}
        <h1 className="text-lg sm:text-xl font-bold ml-5">{pageTitle}</h1>

        {/* Right side */}
        {/* <div className="flex gap-2 mx-32"> */}
        <div className="mr-1 sm:mr-3 md:mr-4 lg:mr-6">
          {pageTitle == "Schedule" && (
            <NavLink
              to={`/bookmarks?conf=${confCode}`}
              className={({ isActive }) =>
                [
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  isActive
                    ? "bg-gray-800"
                    : "border border-gray-700 hover:bg-gray-900",
                ].join(" ")
              }
              aria-label="Filter by bookmarks"
            >
              <BookmarkIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Bookmarks</span>
            </NavLink>
          )}

          {pageTitle == "Bookmarks" && (
            <NavLink
              to={`/schedule?conf=${confCode}`}
              className={({ isActive }) =>
                [
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  isActive
                    ? "bg-gray-800"
                    : "border border-gray-700 hover:bg-gray-900",
                ].join(" ")
              }
              aria-label="Schedule"
            >
              <CalendarIcon className="h-5 w-5" />
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
        </div>
      </div>

      {/* Sticky day tabs */}
      <div className="sticky top-14 z-30 flex flex-wrap justify-center gap-2 border-b border-gray-700 bg-gray-950/80 py-2 backdrop-blur">
        {days.map(({ day }) => {
          const active = activeDays.includes(day);
          return (
            <button
              key={day}
              onClick={() => scrollToDay(day)}
              aria-current={active ? "date" : undefined}
              className={[
                "mx-1 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-gray-800 text-white"
                  : "border border-gray-700 text-gray-200 hover:bg-gray-900",
              ].join(" ")}
            >
              {fmtTab(day)}
            </button>
          );
        })}
      </div>

      {/* Day sections */}
      {days.map(({ day, events }) => (
        <section
          key={day}
          ref={(el) => {
            sectionRefs.current[day] = el as HTMLDivElement | null;
          }}
          data-day={day}
          className="px-4 sm:px-5"
        >
          <h2 className="ml-1 mt-6 mb-3 scroll-mt-[116px] text-xl font-bold text-gray-100 md:text-2xl">
            {fmtHeading(day)}
          </h2>
          <ul className="mb-8 grid gap-3">
            {events.map((evt) => (
              <EventItem
                key={evt.id}
                event={evt}
                confCode={confCode}
                isBookmarked={bookmarks.has(evt.id)}
                onToggle={makeToggle(evt.id)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
