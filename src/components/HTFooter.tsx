export function HTFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
      {/* glow bar */}
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-cyan-500/20 via-fuchsia-400/20 to-amber-400/20"
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-3 items-start text-sm">
          <div className="text-neutral-300">
            <p className="font-semibold">HackerTracker</p>
            <p className="mt-1 text-neutral-400">
              Community-built schedules for hackers, by hackers.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-neutral-300">
            <a
              href="/conferences"
              className="hover:text-white underline-offset-4 hover:underline"
            >
              Conferences
            </a>
            <a
              href="/about"
              className="hover:text-white underline-offset-4 hover:underline"
            >
              About
            </a>
            <a
              href="/support"
              className="hover:text-white underline-offset-4 hover:underline"
            >
              Support
            </a>
            <a
              href="https://github.com/junctor/hackertracker-web"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white underline-offset-4 hover:underline"
            >
              GitHub
            </a>
          </nav>

          <div className="sm:text-right text-neutral-400">
            Built with <span className="text-red-500">❤</span> by the
            HackerTracker team
          </div>
        </div>
      </div>
    </footer>
  );
}
