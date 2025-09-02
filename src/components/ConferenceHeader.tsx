import { Fragment } from "react";
import { Link, useLocation } from "react-router";
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
} from "@heroicons/react/24/outline";
import type { HTConference } from "@/types/db";

type NavItem = {
  key: string;
  label: string;
  to: string;
  external?: boolean;
  icon: React.ElementType;
};

export function ConferenceHeader({ conference }: { conference: HTConference }) {
  const { pathname } = useLocation();

  const items: NavItem[] = [
    {
      key: "ht",
      label: "HackerTracker",
      to: "/",
      icon: HomeIcon,
    },
    {
      key: "conf",
      label: "Conference",
      to: conference.link,
      external: true,
      icon: ArrowTopRightOnSquareIcon,
    },
    {
      key: "github",
      label: "GitHub",
      to: "https://github.com/junctor/hackertracker-web",
      external: true,
      icon: CodeBracketSquareIcon,
    },
  ];

  return (
    <header className="sticky top-0 h-14 z-50 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="flex w-full items-center justify-between h-14 px-4 sm:px-6 lg:px-10">
        {/* Left: Conference name / brand */}
        <div className="min-w-0">
          <span className="block truncate text-base sm:text-lg font-semibold text-white">
            {conference.name}
          </span>
          {/* Optional subline: uncomment if you want the code/timezone visible */}
          {/* <span className="text-xs text-neutral-400">{conference.code} · {conference.timezone}</span> */}
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3">
          {items.map(({ key, label, to, external, icon: Icon }) =>
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
                <span className="hidden sm:inline">{label}</span>
              </a>
            ) : (
              <Link
                key={key}
                to={to}
                className={[
                  "inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm transition-colors",
                  pathname === to
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-900/60 text-neutral-300 hover:bg-neutral-900 hover:text-white",
                ].join(" ")}
                aria-label={label}
                title={label}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          )}
        </nav>

        {/* Mobile: Browse + Popover */}
        <div className="flex items-center gap-2 sm:hidden">
          <Popover className="relative">
            {({ open }) => (
              <>
                <PopoverButton
                  aria-label="Open menu"
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
                      {items.map(({ key, label, to, external, icon: Icon }) =>
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
                              pathname === to
                                ? "bg-neutral-900 text-white"
                                : "text-neutral-300 hover:bg-neutral-900 hover:text-white",
                            ].join(" ")}
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
