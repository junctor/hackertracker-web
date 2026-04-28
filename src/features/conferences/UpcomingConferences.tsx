import { useEffect, useState } from "react";

import type { HTConference } from "@/types/db";

import { getUpcomingConferences } from "@/lib/db";

import { ConferenceCard } from "./ConferenceCard";

export function UpcomingConferences() {
  const [conferences, setConferences] = useState<HTConference[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await getUpcomingConferences();
        if (!ac.signal.aborted) setConferences(list ?? []);
      } catch {
        if (!ac.signal.aborted) setErr("Failed to load conferences.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <section aria-label="Upcoming conferences" className="space-y-4">
        <Header title="Upcoming Conferences" count={undefined} id="upcoming-mini" />
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-full animate-pulse rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"
            />
          ))}
        </div>
      </section>
    );
  }

  if (err) {
    return (
      <section aria-label="Upcoming conferences" className="space-y-4">
        <Header title="Upcoming Conferences" count={0} id="upcoming-mini" />
        <EmptyState message={err} />
      </section>
    );
  }

  if (conferences.length === 0) return null;

  return (
    <section aria-label="Upcoming conferences" className="space-y-4">
      <Header title="Upcoming Conferences" count={conferences.length} id="upcoming-mini" />
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {conferences.map((c) => (
          <div key={c.id} className="h-full">
            <ConferenceCard conference={c} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Header({ title, count, id }: { title: string; count?: number; id: string }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2
          id={`${id}-title`}
          className="group inline-flex items-center gap-2 text-base font-semibold text-neutral-100 sm:text-lg"
        >
          {title}
          {typeof count === "number" && (
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
              {count}
            </span>
          )}
          <a
            href={`#${id}`}
            className="text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-300"
            aria-label={`Link to section ${title}`}
          >
            #
          </a>
        </h2>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="ui-empty-state text-neutral-300">
      <p className="text-sm">{message}</p>
    </div>
  );
}
