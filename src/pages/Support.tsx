import { useEffect } from "react";
import { HTFooter } from "@/components/HTFooter";
import { HTHeader } from "@/components/HTHeader";

export function Support() {
  useEffect(() => {
    document.title = "Support · Hacker Tracker";
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <HTHeader />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Support & Contributing
            </h1>
            <p className="mt-2 max-w-3xl text-neutral-300">
              Conferences, contributors, and curious folks — here’s how to work
              with Hacker Tracker.
            </p>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://discord.gg/jJNSZYdnF7"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-700 hover:bg-neutral-850"
              >
                <span className="i-lucide-message-circle" />
                Join Discord
              </a>
              <a
                href="https://github.com/junctor"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-700 hover:bg-neutral-850"
              >
                <span className="i-lucide-github" />
                GitHub org
              </a>
              <a
                href="https://defcon.social/@aNullValue"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-700 hover:bg-neutral-850"
              >
                Contact @aNullValue
              </a>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Conferences section */}
          <section aria-labelledby="conferences" className="mb-12">
            <h2
              id="conferences"
              className="text-lg font-semibold text-neutral-200"
            >
              How can a conference use Hacker Tracker?
            </h2>
            <p className="mt-2 max-w-3xl text-neutral-300">
              If you represent a conference and want to make your information
              available in Hacker Tracker, please reach out to{" "}
              <a
                href="https://defcon.social/@aNullValue"
                className="underline hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                @aNullValue
              </a>
              .
            </p>

            <ul className="mt-4 grid gap-2 text-neutral-300 sm:grid-cols-2">
              {[
                "No charge for most conferences (large ones may reimburse operational expenses)",
                "We may request an admission ticket or two",
                "In-kind sponsor recognition (if your event has sponsors)",
                "We never collect or sell user data",
                "JSON exports available for your site",
                "Integrations: Pretalx, Sessionize, Sched",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-md border border-neutral-800/60 bg-neutral-900/50 px-3 py-2"
                >
                  <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Source code */}
          <section aria-labelledby="source" className="mb-12">
            <h2 id="source" className="text-lg font-semibold text-neutral-200">
              Source Code
            </h2>
            <p className="mt-2 max-w-3xl text-neutral-300">
              Our project is made up of several apps maintained separately:
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                {
                  name: "Hacker Tracker (Android)",
                  href: "https://github.com/junctor/android",
                },
                {
                  name: "Hacker Tracker (iOS)",
                  href: "https://github.com/junctor/hackertracker-ios",
                },
                {
                  name: "Hacker Tracker (Web)",
                  href: "https://github.com/junctor/hackertracker-web",
                },
                {
                  name: "Merch Staff App (Android)",
                  href: "",
                  note: "Source not yet available",
                },
                {
                  name: "ConfMgr (Web)",
                  href: "",
                  note: "Source not yet available",
                },
              ].map((repo) => (
                <div
                  key={repo.name}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
                >
                  {repo.href ? (
                    <a
                      href={repo.href}
                      className="font-medium text-neutral-200 underline hover:text-white"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {repo.name}
                    </a>
                  ) : (
                    <div className="font-medium text-neutral-400">
                      {repo.name}
                    </div>
                  )}
                  {repo.note && (
                    <p className="mt-1 text-sm text-neutral-500">{repo.note}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Issues & contributing */}
          <section aria-labelledby="contrib">
            <h2 id="contrib" className="text-lg font-semibold text-neutral-200">
              Bug Reports & Contributions
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                <h3 className="font-medium text-neutral-100">Security</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Found a vulnerability? Use GitHub’s{" "}
                  <em>Report a vulnerability</em> in the appropriate repo.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                <h3 className="font-medium text-neutral-100">
                  Bugs & Features
                </h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Open an issue in the relevant repo. If it spans multiple
                  repos, one report is enough.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 md:col-span-2">
                <h3 className="font-medium text-neutral-100">Contributing</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Interested in contributing? Reach out to any of us. We don’t
                  yet have a formal onboarding process, but we’d love to
                  collaborate.
                </p>
                <a
                  href="https://discord.gg/jJNSZYdnF7"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-700 hover:bg-neutral-850"
                >
                  Join our Discord
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <HTFooter />
    </div>
  );
}
