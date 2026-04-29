import { Popover, Transition, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  LifebuoyIcon,
  CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

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

export function HTHeader({ variant = "default" }: { variant?: "default" | "splash" }) {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base =
    "sticky top-0 z-50 min-h-16 border-b border-white/10 text-white backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 supports-[backdrop-filter]:backdrop-blur-md";
  const bg =
    variant === "splash"
      ? scrolled
        ? "bg-slate-950/90 shadow-[0_12px_32px_rgba(2,6,23,0.28)]"
        : "bg-slate-950/72 shadow-[0_10px_28px_rgba(2,6,23,0.18)]"
      : scrolled
        ? "bg-slate-950/92 shadow-[0_12px_32px_rgba(2,6,23,0.3)]"
        : "bg-slate-950/82";

  return (
    <header className={`${base} ${bg}`}>
      <a href="#main" className="ui-skip-link ui-focus-ring focus-visible:outline-none">
        Skip to content
      </a>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#017FA4]/35 to-transparent"
      />

      <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
        <Link
          to="/"
          aria-label="Hacker Tracker Home"
          className="ui-focus-ring group min-w-0 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/4 focus-visible:outline-none"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="truncate text-xl font-bold tracking-tight text-slate-50 drop-shadow-[0_0_14px_rgba(108,205,187,0.16)] transition-colors group-hover:text-white group-hover:drop-shadow-[0_0_18px_rgba(108,205,187,0.22)] sm:text-2xl">
              Hacker Tracker
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {items.map(({ key, label, to, external, icon: Icon }) => {
            const active = pathname === to;
            const common =
              "ui-btn-base ui-focus-ring group min-h-10 gap-2 rounded-xl border-white/10 bg-white/4 px-3 text-sm text-slate-300 shadow-[0_10px_28px_rgba(2,6,23,0.16)] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(2,6,23,0.24)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-[0_16px_34px_rgba(2,6,23,0.24)]";
            const classes = external
              ? `${common} hover:border-[#017FA4]/28 hover:bg-[#017FA4]/8 hover:text-slate-50`
              : active
                ? `${common} border-[#017FA4]/35 bg-[#017FA4]/12 text-white`
                : `${common} hover:border-[#017FA4]/28 hover:bg-[#017FA4]/8 hover:text-slate-50`;
            const iconClassName = active
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
                aria-label={label}
                title={label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`h-5 w-5 ${iconClassName}`} />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Link
            to="/conferences"
            className="ui-btn-base ui-btn-secondary ui-focus-ring min-h-10 rounded-xl border-white/10 bg-white/4 px-3 text-xs text-slate-200 shadow-[0_10px_24px_rgba(2,6,23,0.16)] hover:-translate-y-0.5 hover:border-[#017FA4]/28 hover:bg-[#017FA4]/8 hover:shadow-[0_16px_34px_rgba(2,6,23,0.24)] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_16px_34px_rgba(2,6,23,0.24)] focus-visible:outline-none"
          >
            Browse
          </Link>

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
                      {items.map(({ key, label, to, external, icon: Icon }) =>
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
                              pathname === to
                                ? "border-[#017FA4]/35 bg-[#017FA4]/12 text-white"
                                : "border-transparent text-slate-300 hover:border-white/10 hover:bg-[#017FA4]/8 hover:text-white",
                            ].join(" ")}
                            aria-current={pathname === to ? "page" : undefined}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                pathname === to
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
