import { useEffect } from "react";
import { HTFooter } from "@/components/HTFooter";
import { HTHeader } from "@/components/HTHeader";

export function About() {
  useEffect(() => {
    document.title = "About · Hacker Tracker";
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <HTHeader />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <div className="flex items-center gap-4">
              <img
                src="https://github.com/junctor/android/blob/main/app/src/main/play_store_512.png?raw=1"
                alt="Hacker Tracker Logo"
                className="h-12 w-12 rounded-xl ring-1 ring-neutral-700/50"
              />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  About Hacker Tracker
                </h1>
                <p className="mt-1 text-sm text-neutral-400">
                  Help your conference attendees help themselves.
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-neutral-300">
              Hacker Tracker is a conference information app used by
              tech-related conferences of all sizes. Our mission is to help
              attendees help themselves with accurate, up-to-date schedules and
              details.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Who uses */}
          <section aria-labelledby="who-uses" className="mb-12">
            <div className="flex items-center justify-between">
              <h2
                id="who-uses"
                className="text-lg font-semibold text-neutral-200"
              >
                Who uses Hacker Tracker?
              </h2>
              <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-400">
                Community-driven
              </span>
            </div>

            <ul className="mt-4 grid gap-2 text-neutral-300 sm:grid-cols-2 md:grid-cols-3">
              {[
                "DEF CON",
                "NolaCon",
                "HackGDL",
                "Disobey",
                "CactusCon",
                "H2HC",
                "BugCon",
                "Ekoparty",
                "Hack Red Con",
                "SaintCon",
                "MOCA",
                "VCF Midwest",
                "Many BSides conferences",
                "…and others",
              ].map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-2 rounded-md border border-neutral-800/60 bg-neutral-900/50 px-3 py-2"
                >
                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Who we are */}
          <section aria-labelledby="who-we-are" className="mb-12">
            <h2
              id="who-we-are"
              className="text-lg font-semibold text-neutral-200"
            >
              Who We Are
            </h2>
            <p className="mt-2 max-w-3xl text-neutral-300">
              We’re a small group of friends who met at DEF CON and recognized
              the need for improved attendee communication at conferences
              everywhere.
            </p>

            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  handle: "advice",
                  url: "https://github.com/Advice-Dog",
                  role: "Android",
                  avatar: "https://github.com/Advice-Dog.png",
                },
                {
                  handle: "aNullValue",
                  url: "https://github.com/aNullValue",
                  role: "Project manager & ConfMgr",
                  avatar: "https://github.com/aNullValue.png",
                },
                {
                  handle: "cak",
                  url: "https://github.com/cak",
                  role: "Web",
                  avatar: "https://github.com/cak.png",
                },
                {
                  handle: "l4wke",
                  url: "https://github.com/sethlaw",
                  role: "iOS",
                  avatar: "https://github.com/sethlaw.png",
                },
              ].map((m) => (
                <li
                  key={m.handle}
                  className="rounded-xl border border-neutral-800 bg-neutral-925/50 p-4"
                >
                  <a
                    href={m.url}
                    className="group flex items-center gap-3"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={m.avatar}
                      alt={`${m.handle} avatar`}
                      className="h-10 w-10 rounded-lg ring-1 ring-neutral-700/50"
                    />
                    <div>
                      <div className="font-medium text-white group-hover:underline">
                        {m.handle}
                      </div>
                      <div className="text-sm text-neutral-400">{m.role}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Thanks */}
          <section aria-labelledby="thanks">
            <h2 id="thanks" className="text-lg font-semibold text-neutral-200">
              Thanks
            </h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              <li className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <a
                  href="https://defcon.org"
                  className="text-neutral-300 hover:text-white underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  DEF CON
                </a>
              </li>
              <li className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <a
                  href="https://www.ccc.de/en/"
                  className="text-neutral-300 hover:text-white underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Chaos Computer Club (CCC)
                </a>
                <p className="mt-1 text-sm text-neutral-400">
                  Source of inspiration
                </p>
              </li>
              <li className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 md:col-span-2">
                <a
                  href="https://infosec.exchange/@shortstack"
                  className="text-neutral-300 hover:text-white underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  ShortStack
                </a>
                <p className="mt-1 text-sm text-neutral-400">
                  Original Android release (2012)
                </p>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <HTFooter />
    </div>
  );
}
