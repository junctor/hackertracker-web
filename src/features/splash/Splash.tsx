import { UpcomingConferences } from "../conferences/UpcomingConferences";

export function Splash() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center text-white">
      <header className="my-12">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold leading-tight bg-gradient-to-r from-green-400 via-emerald-500 to-green-300 bg-clip-text text-transparent">
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
          >
            <button className="rounded-full bg-white text-black px-5 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-1 hover:bg-gray-200">
              Download on the App Store
            </button>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.shortstack.hackertracker"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get Hacker Tracker on Google Play"
          >
            <button className="rounded-full bg-green-600 text-white px-5 py-2 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-1 hover:bg-green-500">
              Get it on Google Play
            </button>
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
  );
}
