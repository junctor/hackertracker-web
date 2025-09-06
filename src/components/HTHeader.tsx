import { Fragment, useEffect, useState } from "react";
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
  Squares2X2Icon,
  InformationCircleIcon,
  LifebuoyIcon,
  CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";

type NavItem = {
  key: string;
  label: string;
  to: string;
  external?: boolean;
  icon: React.ElementType;
};

const items: NavItem[] = [
  {
    key: "confs",
    label: "Conferences",
    to: "/conferences",
    icon: Squares2X2Icon,
  },
  { key: "about", label: "About", to: "/about", icon: InformationCircleIcon },
  { key: "support", label: "Support", to: "/support", icon: LifebuoyIcon },
  {
    key: "github",
    label: "GitHub",
    to: "https://github.com/junctor/hackertracker-web",
    external: true,
    icon: CodeBracketSquareIcon,
  },
];

export function HTHeader({
  variant = "default",
}: {
  variant?: "default" | "splash";
}) {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base =
    "sticky top-0 h-14 z-50 border-b border-neutral-800 transition-colors backdrop-blur supports-[backdrop-filter]:backdrop-blur";
  const bg =
    variant === "splash"
      ? scrolled
        ? "bg-neutral-950/80"
        : "bg-transparent"
      : scrolled
        ? "bg-neutral-950/90"
        : "bg-neutral-950/70";

  return (
    <header className={`${base} ${bg}`}>
      {/* Skip link for keyboard nav */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] rounded bg-neutral-900 px-3 py-2 text-sm text-white shadow"
      >
        Skip to content
      </a>

      <div className="flex w-full items-center justify-between h-14 px-4 sm:px-6 lg:px-10">
        {/* Brand */}
        <Link
          to="/"
          aria-label="HackerTracker Home"
          className="bg-gradient-to-r from-cyan-400 via-white to-red-500 bg-clip-text text-transparent text-xl sm:text-2xl font-extrabold tracking-tight"
        >
          HackerTracker
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          {items.map(({ key, label, to, external, icon: Icon }) => {
            const active = pathname === to;
            const common =
              "inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm transition-colors";
            const classes = external
              ? `${common} bg-neutral-900/60 text-neutral-300 hover:bg-neutral-900 hover:text-white`
              : active
                ? `${common} bg-neutral-900 text-white`
                : `${common} bg-neutral-900/60 text-neutral-300 hover:bg-neutral-900 hover:text-white`;
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
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{label}</span>
              </a>
            ) : (
              <Link
                key={key}
                to={to}
                className={classes}
                aria-label={label}
                title={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            to="/conferences"
            className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
          >
            Browse
          </Link>

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
                            aria-current={pathname === to ? "page" : undefined}
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
