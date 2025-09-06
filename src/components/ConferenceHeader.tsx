import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import {
  Popover,
  Transition,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketSquareIcon,
  BookmarkSquareIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
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
    pathname.startsWith("/schedule") &&
    (params.get("conf") ?? confCode) === confCode;
  const isBookmarks =
    pathname.startsWith("/bookmarks") &&
    (params.get("conf") ?? confCode) === confCode;
  const isPeople =
    pathname.startsWith("/people") &&
    (params.get("conf") ?? confCode) === confCode;

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
        label: "HackerTracker",
        to: "/",
        icon: HomeIcon,
      },
      {
        key: "github",
        label: "GitHub",
        to: "https://github.com/junctor/hackertracker-web",
        external: true,
        icon: CodeBracketSquareIcon,
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
  }, [
    scheduleHref,
    isSchedule,
    bookmarksHref,
    isBookmarks,
    peopleHref,
    conference.link,
  ]);

  const baseHeader =
    "sticky top-0 h-14 z-50 border-b border-neutral-800 transition-colors backdrop-blur supports-[backdrop-filter]:backdrop-blur";
  const bg = scrolled ? "bg-neutral-950/90" : "bg-neutral-950/70";

  return (
    <header className={`${baseHeader} ${bg}`}>
      <div className="flex w-full items-center justify-between h-14 px-4 sm:px-6 lg:px-10">
        {/* Left: Conference name / brand */}
        <div className="min-w-0">
          <Link
            to={scheduleHref}
            className="block truncate text-lg sm:text-xl font-extrabold text-white hover:opacity-90"
            aria-label={`${conference.name} — view schedule`}
          >
            {conference.name}
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          {items.map(({ key, label, to, external, icon: Icon, ariaCurrent }) =>
            external ? (
              <a
                key={key}
                href={to}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
                aria-label={label}
                title={label}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{label}</span>
              </a>
            ) : (
              <Link
                key={key}
                to={to}
                className={[
                  "inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm transition-colors",
                  ariaCurrent
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-900/60 text-neutral-300 hover:bg-neutral-900 hover:text-white",
                ].join(" ")}
                aria-label={label}
                title={label}
                aria-current={ariaCurrent ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          )}
        </nav>

        {/* Mobile: Popover menu */}
        <div className="flex items-center gap-2 sm:hidden">
          <Popover className="relative">
            {({ open }) => (
              <>
                <PopoverButton
                  aria-label={open ? "Close menu" : "Open menu"}
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
                    open ? "ring-1 ring-cyan-400/40" : "",
                  ].join(" ")}
                >
                  {open ? (
                    <XMarkIcon
                      className="h-5 w-5 text-neutral-200"
                      aria-hidden="true"
                    />
                  ) : (
                    <Bars3Icon
                      className="h-5 w-5 text-neutral-200"
                      aria-hidden="true"
                    />
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
                  <PopoverPanel className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-neutral-800 bg-neutral-950/95 p-2 shadow-lg backdrop-blur">
                    <div className="space-y-1 text-sm">
                      {items.map(
                        ({
                          key,
                          label,
                          to,
                          external,
                          icon: Icon,
                          ariaCurrent,
                        }) =>
                          external ? (
                            <PopoverButton
                              key={key}
                              as="a"
                              href={to}
                              target="_blank"
                              rel="noreferrer"
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
                            >
                              <Icon className="h-5 w-5" />
                              {label}
                            </PopoverButton>
                          ) : (
                            <PopoverButton
                              key={key}
                              as={Link}
                              to={to}
                              className={[
                                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors",
                                ariaCurrent
                                  ? "bg-neutral-900 text-white"
                                  : "text-neutral-300 hover:bg-neutral-900 hover:text-white",
                              ].join(" ")}
                              aria-current={ariaCurrent ? "page" : undefined}
                            >
                              <Icon className="h-5 w-5" />
                              {label}
                            </PopoverButton>
                          )
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
