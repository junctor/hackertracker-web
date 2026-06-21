import { Link } from "react-router";

export function HTFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-(--color-page-bg) text-slate-300">
      <div className="ui-container py-5 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
              Hacker Tracker
            </p>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Community-built schedules, people, and conference information for Hacker Tracker.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300"
          >
            <Link
              to="/conferences"
              className="ui-focus-ring rounded px-1 py-0.5 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none"
            >
              Conferences
            </Link>
            <Link
              to="/about"
              className="ui-focus-ring rounded px-1 py-0.5 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none"
            >
              About
            </Link>
            <Link
              to="/support"
              className="ui-focus-ring rounded px-1 py-0.5 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none"
            >
              Support
            </Link>
            <a
              href="https://github.com/junctor/hackertracker-web"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-focus-ring rounded px-1 py-0.5 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
