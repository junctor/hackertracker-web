import { useEffect } from "react";
import { HTHeader } from "@/components/HTHeader";
import { UpcomingConferences } from "../conferences/UpcomingConferences";
import { HTFooter } from "@/components/HTFooter";

export function Splash() {
  useEffect(() => {
    document.title = "Hacker Tracker — Schedules for hackers, by hackers";
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <HTHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center text-white">
        {/* add top padding to clear the fixed nav */}
        <header className="my-5 pt-16 sm:pt-20">
          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold leading-tight 
  bg-gradient-to-r from-cyan-400 via-white to-red-500 bg-clip-text text-transparent"
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

        <section className="w-full max-w-5xl mx-auto px-4">
          <UpcomingConferences />
          <div className="mt-6 text-center">
            <a
              href="/conferences"
              className="text-blue-500 hover:underline font-medium"
            >
              View all conferences
            </a>
          </div>
        </section>
      </main>
      <HTFooter />
    </div>
  );
}
