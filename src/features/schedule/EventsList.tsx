import {
  BookmarkIcon,
  // TagIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router";
import { Virtuoso, type Components, type ItemProps, type ListProps } from "react-virtuoso";

import type { HTConference } from "@/types/db";
import type { GroupedSchedule, ProcessedEvent } from "@/types/ht";

import { fmtHeading, fmtTab } from "@/lib/utils/schedule";
import { loadConfBookmarks, toggleBookmark } from "@/lib/utils/storage";

import EventItem from "./EventItem";

type ScheduleDay = {
  day: string;
  events: ProcessedEvent[];
};

type VirtuosoContext = unknown;
type VirtuosoListProps = ListProps & { context: VirtuosoContext };
type VirtuosoItemProps = ItemProps<ProcessedEvent> & {
  context: VirtuosoContext;
};

const VirtuosoList = React.forwardRef<HTMLDivElement, VirtuosoListProps>(function VirtuosoList(
  { children, style, "data-testid": dataTestId },
  ref,
) {
  return (
    <ul
      ref={ref as unknown as React.Ref<HTMLUListElement>}
      style={style}
      data-testid={dataTestId}
      role="list"
      className="mb-8 list-none p-0"
    >
      {children}
    </ul>
  );
});
VirtuosoList.displayName = "VirtuosoList";

function VirtuosoItem({ children, style, context, item, ...itemProps }: VirtuosoItemProps) {
  void context;
  void item;
  return (
    <li {...itemProps} style={style} className="mb-3 last:mb-0">
      {children}
    </li>
  );
}
VirtuosoItem.displayName = "VirtuosoItem";

const VIRTUOSO_COMPONENTS: Components<ProcessedEvent, VirtuosoContext> = {
  List: VirtuosoList,
  Item: VirtuosoItem,
};

const SITE_HEADER_HEIGHT_PX = 56;
const STICKY_HEADING_CLEARANCE_PX = 16;

export default function EventsList({
  dateGroup,
  conf,
  pageTitle,
}: {
  dateGroup: GroupedSchedule;
  conf: HTConference;
  pageTitle: string;
}) {
  const confCode = conf.code;
  const nowSeconds = useMemo(() => Math.floor(Date.now() / 1000), []);

  const days: ScheduleDay[] = useMemo(
    () => Object.entries(dateGroup).map(([day, events]) => ({ day, events })),
    [dateGroup],
  );

  const [selectedDay, setSelectedDay] = useState(days[0]?.day ?? "");
  const [stickyToolsHeight, setStickyToolsHeight] = useState(0);
  const [stickyTabsHeight, setStickyTabsHeight] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const stickyToolsRef = useRef<HTMLDivElement | null>(null);
  const stickyTabsRef = useRef<HTMLDivElement | null>(null);

  const makeToggle = useCallback(
    (id: number) => () => toggleBookmark(confCode, id, setBookmarks),
    [confCode],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBookmarks(loadConfBookmarks(confCode));
  }, [confCode]);

  const resolvedDay = useMemo(() => {
    if (selectedDay && days.some(({ day }) => day === selectedDay)) {
      return selectedDay;
    }
    return days[0]?.day ?? "";
  }, [days, selectedDay]);

  useEffect(() => {
    if (resolvedDay && selectedDay !== resolvedDay) {
      setSelectedDay(resolvedDay);
    }
  }, [resolvedDay, selectedDay]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stickyTools = stickyToolsRef.current;
    if (!stickyTools) return;

    const updateStickyToolsHeight = () => {
      setStickyToolsHeight(Math.ceil(stickyTools.getBoundingClientRect().height));
    };

    updateStickyToolsHeight();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateStickyToolsHeight) : null;

    resizeObserver?.observe(stickyTools);
    window.addEventListener("resize", updateStickyToolsHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateStickyToolsHeight);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stickyTabs = stickyTabsRef.current;
    if (!stickyTabs) return;

    const updateStickyTabsHeight = () => {
      setStickyTabsHeight(Math.ceil(stickyTabs.getBoundingClientRect().height));
    };

    updateStickyTabsHeight();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateStickyTabsHeight) : null;

    resizeObserver?.observe(stickyTabs);
    window.addEventListener("resize", updateStickyTabsHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateStickyTabsHeight);
    };
  }, []);

  const stickyToolsTopStyle = useMemo(() => ({ top: `${SITE_HEADER_HEIGHT_PX}px` }), []);
  const stickyTabsTopStyle = useMemo(
    () => ({ top: `${SITE_HEADER_HEIGHT_PX + stickyToolsHeight}px` }),
    [stickyToolsHeight],
  );
  const headingScrollOffsetPx =
    SITE_HEADER_HEIGHT_PX + stickyToolsHeight + stickyTabsHeight + STICKY_HEADING_CLEARANCE_PX;
  const headingScrollStyle = useMemo(
    () => ({ scrollMarginTop: `${headingScrollOffsetPx}px` }),
    [headingScrollOffsetPx],
  );

  useEffect(() => {
    if (!resolvedDay) return;
    const heading = headingRef.current;
    if (!heading || typeof window === "undefined") return;
    const rect = heading.getBoundingClientRect();
    if (rect.top < headingScrollOffsetPx || rect.bottom > window.innerHeight) {
      const top = window.scrollY + rect.top - headingScrollOffsetPx;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    }
  }, [headingScrollOffsetPx, resolvedDay]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number, day: string) => {
      if (days.length === 0) return;
      const lastIndex = days.length - 1;
      let nextIndex = index;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = index === 0 ? lastIndex : index - 1;
          break;
        case "ArrowRight":
          e.preventDefault();
          nextIndex = index === lastIndex ? 0 : index + 1;
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = lastIndex;
          break;
        case "Enter":
          e.preventDefault();
          if (resolvedDay !== day) {
            setSelectedDay(day);
          }
          return;
        case " ":
        case "Spacebar":
          e.preventDefault();
          if (resolvedDay !== day) {
            setSelectedDay(day);
          }
          return;
        default:
          return;
      }

      const nextDay = days[nextIndex]?.day;
      if (!nextDay) return;
      setSelectedDay(nextDay);
      const nextButton = tabButtonRefs.current[nextDay];
      nextButton?.focus();
      nextButton?.scrollIntoView({ block: "nearest", inline: "nearest" });
    },
    [days, resolvedDay],
  );

  const activeDay = days.find(({ day }) => day === resolvedDay) ?? null;
  const activeDayLabel = activeDay ? fmtHeading(activeDay.day, conf.timezone || "UTC") : null;
  const activeDayEventCountLabel = activeDay
    ? `${activeDay.events.length} ${activeDay.events.length === 1 ? "event" : "events"}`
    : null;

  const computeItemKey = useCallback((_: number, evt: ProcessedEvent) => evt.id, []);
  const itemContent = useCallback(
    (_: number, evt: ProcessedEvent) => (
      <EventItem
        event={evt}
        confCode={confCode}
        isBookmarked={bookmarks.has(evt.id)}
        nowSeconds={nowSeconds}
        onToggle={makeToggle(evt.id)}
      />
    ),
    [bookmarks, confCode, makeToggle, nowSeconds],
  );

  return (
    <div className="min-h-screen text-gray-100">
      <div
        ref={stickyToolsRef}
        className="sticky z-40 border-b border-white/8 bg-gray-950/92 backdrop-blur"
        style={stickyToolsTopStyle}
      >
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

      <div
        ref={stickyTabsRef}
        className="sticky z-30 border-b border-white/8 bg-gray-950/92 py-2 backdrop-blur"
        style={stickyTabsTopStyle}
      >
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
          <div
            role="tablist"
            aria-label="Schedule days"
            aria-orientation="horizontal"
            className="flex min-w-max justify-center gap-2"
          >
            {days.map(({ day, events }, index) => (
              <button
                key={day}
                ref={(el) => {
                  tabButtonRefs.current[day] = el;
                }}
                id={`day-tab-${day}`}
                type="button"
                role="tab"
                aria-selected={resolvedDay === day}
                aria-controls={`day-panel-${day}`}
                aria-label={`${fmtTab(day, conf.timezone || "UTC")}, ${events.length} ${
                  events.length === 1 ? "event" : "events"
                }`}
                tabIndex={resolvedDay === day ? 0 : -1}
                onClick={() => setSelectedDay(day)}
                onKeyDown={(e) => handleTabKeyDown(e, index, day)}
                className={[
                  "ui-focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm whitespace-nowrap transition focus-visible:outline-none",
                  resolvedDay === day
                    ? "border-[#017FA4]/30 bg-[#0D294A]/58 text-white"
                    : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/14 hover:bg-white/[0.05] hover:text-gray-100",
                ].join(" ")}
              >
                <span className="font-semibold">{fmtTab(day, conf.timezone || "UTC")}</span>
                <span
                  className={[
                    "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    resolvedDay === day
                      ? "border-[#017FA4]/26 bg-[#017FA4]/12 text-[#9FE4D7]"
                      : "border-white/8 bg-black/15 text-gray-400 group-hover:text-gray-200",
                  ].join(" ")}
                >
                  {events.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-5">
          <div className="ui-empty-state">
            <p className="text-gray-200">No events are available.</p>
          </div>
        </div>
      ) : activeDay ? (
        <section
          id={`day-panel-${activeDay.day}`}
          role="tabpanel"
          aria-labelledby={`day-tab-${activeDay.day}`}
          tabIndex={0}
        >
          <div className="mx-auto mt-5 mb-3 max-w-7xl px-4 sm:px-5">
            <div className="flex flex-col gap-3 border-b border-white/8 pb-3.5 sm:flex-row sm:items-end sm:justify-between">
              <h2
                ref={headingRef}
                style={headingScrollStyle}
                className="ml-1 text-xl font-bold tracking-tight text-gray-100 md:text-2xl"
              >
                {activeDayLabel}
              </h2>
              {activeDayEventCountLabel ? (
                <p className="inline-flex items-center self-start rounded-full border border-white/8 bg-white/3 px-3 py-1 text-sm font-medium text-gray-300 sm:self-auto">
                  {activeDayEventCountLabel}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-5">
            <Virtuoso
              useWindowScroll
              data={activeDay.events}
              computeItemKey={computeItemKey}
              components={VIRTUOSO_COMPONENTS}
              itemContent={itemContent}
              increaseViewportBy={{ top: 200, bottom: 400 }}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
