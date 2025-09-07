import { useEffect } from "react";
import { Link } from "react-router";
import { HTHeader } from "@/components/HTHeader";
import { HTFooter } from "@/components/HTFooter";
import { UpcomingConferences } from "../conferences/UpcomingConferences";

export function Splash() {
  useEffect(() => {
    document.title = "Hacker Tracker — Schedules for hackers, by hackers";
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-gray-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50
                   rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-gray-900 shadow"
      >
        Skip to content
      </a>

      <HTHeader />

      {/* subtle background depth */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10
                   bg-[radial-gradient(60%_40%_at_50%_0%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(50%_50%_at_80%_10%,rgba(244,63,94,0.10),transparent_60%)]"
      />

      <main
        id="main"
        className="flex-1 flex flex-col items-center justify-center px-4 text-center text-white"
      >
        <header className="w-full max-w-6xl mx-auto pt-10 sm:pt-16">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight
                       bg-gradient-to-r from-cyan-400 via-white to-rose-400 bg-clip-text text-transparent
                       drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]"
          >
            Hacker Tracker
          </h1>

          <p className="mt-4 text-lg text-neutral-300">
            For hackers, by hackers. All schedules. All talks. All parties.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <a
              href="https://apps.apple.com/us/app/hackertracker/id1021141595?mt=8"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Hacker Tracker on the App Store"
              className="rounded-full bg-white text-black px-5 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-1 hover:bg-gray-200"
            >
              Download on the App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.shortstack.hackertracker"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get Hacker Tracker on Google Play"
              className="rounded-full bg-green-600 text-white px-5 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-1 hover:bg-green-500"
            >
              Get it on Google Play
            </a>
          </div>
        </header>

        <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10 mb-12">
          <UpcomingConferences />
          <div className="mt-8">
            <Link
              to="/conferences"
              className="text-cyan-300 hover:text-white underline-offset-4 hover:underline font-medium"
            >
              View all conferences
            </Link>
          </div>
        </section>
      </main>
      <HTFooter />
    </div>
  );
}
