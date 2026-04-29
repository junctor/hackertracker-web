import { Popover, Transition, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkSquareIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";

import type { HTConference } from "@/types/db";

type NavItem = {
  key: string;
  label: string;
  to: string;
  external?: boolean;
  icon: React.ElementType;
  ariaCurrent?: boolean;
};

export function ConferenceHeader({ conference }: { conference: HTConference }) {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Build first-class, conference-aware items
  const confCode = conference.code;
  const scheduleHref = `/schedule?conf=${encodeURIComponent(confCode)}`;
  const bookmarksHref = `/bookmarks?conf=${encodeURIComponent(confCode)}`;
  const peopleHref = `/people?conf=${encodeURIComponent(confCode)}`;

  // Active states (path + query awareness)
  const isSchedule =
    pathname.startsWith("/schedule") && (params.get("conf") ?? confCode) === confCode;
  const isBookmarks =
    pathname.startsWith("/bookmarks") && (params.get("conf") ?? confCode) === confCode;
  const isPeople = pathname.startsWith("/people") && (params.get("conf") ?? confCode) === confCode;

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      {
        key: "schedule",
        label: "Schedule",
        to: scheduleHref,
        icon: CalendarDaysIcon,
        ariaCurrent: isSchedule,
      },
      {
        key: "bookmarks",
        label: "Bookmarks",
        to: bookmarksHref,
        icon: BookmarkSquareIcon,
        ariaCurrent: isBookmarks,
      },
      {
        key: "people",
        label: "People",
        to: peopleHref,
        icon: UserGroupIcon,
        ariaCurrent: isPeople,
      },
      {
        key: "home",
        label: "Home",
        to: "/",
        icon: HomeIcon,
      },
    ];

    if (conference.link) {
      base.splice(2, 0, {
        key: "conf",
        label: "Conference",
        to: conference.link!,
        external: true,
        icon: ArrowTopRightOnSquareIcon,
      });
    }
    return base;
  }, [scheduleHref, isSchedule, bookmarksHref, isBookmarks, peopleHref, isPeople, conference.link]);

  const baseHeader =
    "sticky top-0 z-50 min-h-16 border-b border-white/10 text-white backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 supports-[backdrop-filter]:backdrop-blur-md";
  const bg = scrolled ? "bg-slate-950/92 shadow-[0_12px_32px_rgba(2,6,23,0.3)]" : "bg-slate-950/82";

  return (
    <header className={`${baseHeader} ${bg}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#017FA4]/35 to-transparent"
      />

      <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
        <div className="min-w-0">
          <Link
            to={scheduleHref}
            className="ui-focus-ring block truncate rounded-xl px-2 py-1.5 text-lg font-bold tracking-tight text-slate-50 transition-colors hover:bg-white/4 hover:text-white focus-visible:outline-none sm:text-xl"
            aria-label={`${conference.name} — view schedule`}
          >
            {conference.name}
          </Link>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          {items.map(({ key, label, to, external, icon: Icon, ariaCurrent }) => {
            const common =
              "ui-btn-base ui-focus-ring group min-h-10 gap-2 rounded-xl border-white/10 bg-white/4 px-3 text-sm text-slate-300 shadow-[0_10px_28px_rgba(2,6,23,0.16)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(2,6,23,0.24)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-[0_16px_34px_rgba(2,6,23,0.24)]";
            const classes = ariaCurrent
              ? `${common} border-[#017FA4]/35 bg-[#017FA4]/12 text-white`
              : `${common} hover:border-[#017FA4]/28 hover:bg-[#017FA4]/8 hover:text-slate-50`;
            const iconClassName = ariaCurrent
              ? "text-[#6CCDBB]"
              : "text-slate-400 transition-colors group-hover:text-[#6CCDBB] group-focus-visible:text-[#6CCDBB]";

            return external ? (
              <a
                key={key}
                href={to}
                target="_blank"
                rel="noreferrer"
                className={classes}
                aria-label={label}
                title={label}
              >
                <Icon className={`h-5 w-5 ${iconClassName}`} />
                <span className="hidden md:inline">{label}</span>
              </a>
            ) : (
              <Link
                key={key}
                to={to}
                className={classes}
                aria-label={key === "home" ? "Hacker Tracker home" : label}
                title={key === "home" ? "Hacker Tracker home" : label}
                aria-current={ariaCurrent ? "page" : undefined}
              >
                <Icon className={`h-5 w-5 ${iconClassName}`} />
                {key === "home" ? null : <span className="hidden md:inline">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Popover className="relative">
            {({ open }) => (
              <>
                <PopoverButton
                  aria-label={open ? "Close menu" : "Open menu"}
                  className={[
                    "ui-icon-btn ui-focus-ring h-10 min-h-10 w-10 min-w-10 rounded-xl border-white/10 bg-white/4 text-slate-300 shadow-[0_10px_24px_rgba(2,6,23,0.16)] focus-visible:outline-none",
                    open ? "border-[#017FA4]/35 bg-[#017FA4]/12 text-[#6CCDBB]" : "",
                  ].join(" ")}
                >
                  {open ? (
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-5 w-5" aria-hidden="true" />
                  )}
                </PopoverButton>

                <Transition
                  as={Fragment}
                  enter="transition duration-150 ease-out"
                  enterFrom="opacity-0 -translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition duration-100 ease-in"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 -translate-y-1"
                >
                  <PopoverPanel className="absolute right-0 mt-2 w-60 origin-top-right rounded-[1.25rem] border border-white/12 bg-slate-950/98 p-2 shadow-[0_20px_48px_rgba(0,0,0,0.42)] backdrop-blur-md">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/10"
                    />
                    <div className="space-y-1 text-sm">
                      {items.map(({ key, label, to, external, icon: Icon, ariaCurrent }) =>
                        external ? (
                          <PopoverButton
                            key={key}
                            as="a"
                            href={to}
                            target="_blank"
                            rel="noreferrer"
                            className="ui-focus-ring group flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-left text-slate-300 transition-colors hover:border-white/10 hover:bg-[#017FA4]/8 hover:text-white focus-visible:outline-none"
                          >
                            <Icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#6CCDBB] group-focus-visible:text-[#6CCDBB]" />
                            {label}
                          </PopoverButton>
                        ) : (
                          <PopoverButton
                            key={key}
                            as={Link}
                            to={to}
                            className={[
                              "ui-focus-ring group flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none",
                              ariaCurrent
                                ? "border-[#017FA4]/35 bg-[#017FA4]/12 text-white"
                                : "border-transparent text-slate-300 hover:border-white/10 hover:bg-[#017FA4]/8 hover:text-white",
                            ].join(" ")}
                            aria-current={ariaCurrent ? "page" : undefined}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                ariaCurrent
                                  ? "text-[#6CCDBB]"
                                  : "text-slate-400 transition-colors group-hover:text-[#6CCDBB] group-focus-visible:text-[#6CCDBB]"
                              }`}
                            />
                            {label}
                          </PopoverButton>
                        ),
                      )}
                    </div>
                  </PopoverPanel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
    </header>
  );
}
