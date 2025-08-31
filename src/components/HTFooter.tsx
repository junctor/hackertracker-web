export function HTFooter() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-sm text-neutral-400">
          Built with <span className="text-red-500">❤</span> by the
          HackerTracker team ·{" "}
          <a
            href="https://github.com/junctor/hackertracker-web"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white underline transition-colors"
          >
            Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
