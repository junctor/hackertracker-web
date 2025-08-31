import { Fragment, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Popover,
  Transition,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

type NavItem = { label: string; to: string; external?: boolean };
type HeaderVariant = "default" | "splash";

const items: NavItem[] = [
  { label: "Conferences", to: "/conferences" },
  { label: "About", to: "/about" },
  { label: "Support", to: "/support" },
];

export function HTHeader({ variant = "default" }: { variant?: HeaderVariant }) {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base =
    "sticky top-0 z-50 border-b border-neutral-800 transition-colors backdrop-blur";
  const bg =
    variant === "splash"
      ? scrolled
        ? "bg-neutral-950/80"
        : "bg-transparent"
      : scrolled
        ? "bg-neutral-950/90"
        : "bg-neutral-950/80";
  const headerClass = `${base} ${bg}`;

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          aria-label="HackerTracker Home"
          className="bg-gradient-to-r from-cyan-400 via-white to-red-500 bg-clip-text text-transparent text-xl sm:text-2xl font-extrabold tracking-tight"
        >
          HackerTracker
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.to}
                href={item.to}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "transition-colors hover:text-white",
                  pathname === item.to ? "text-white" : "text-neutral-400",
                ].join(" ")}
              >
                {item.label}
              </Link>
            )
          )}
          <a
            href="https://github.com/junctor/hackertracker-web"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </nav>

        {/* Mobile: Browse + Popover */}
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
                      {items.map((item) =>
                        item.external ? (
                          <PopoverButton
                            key={item.to}
                            as="a"
                            href={item.to}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full rounded-md px-3 py-2 text-left text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
                          >
                            {item.label}
                          </PopoverButton>
                        ) : (
                          <PopoverButton
                            key={item.to}
                            as={Link}
                            to={item.to}
                            className={[
                              "block w-full rounded-md px-3 py-2 text-left transition-colors",
                              pathname === item.to
                                ? "bg-neutral-900 text-white"
                                : "text-neutral-300 hover:bg-neutral-900 hover:text-white",
                            ].join(" ")}
                          >
                            {item.label}
                          </PopoverButton>
                        )
                      )}
                      <PopoverButton
                        as="a"
                        href="https://github.com/junctor/hackertracker-web"
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full rounded-md px-3 py-2 text-left text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
                      >
                        GitHub
                      </PopoverButton>
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
