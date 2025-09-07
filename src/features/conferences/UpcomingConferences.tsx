import { useEffect, useState } from "react";
import { getUpcomingConferences } from "@/lib/db";
import type { HTConference } from "@/types/db";
import { ConferenceCard } from "./ConferenceCard";

export function UpcomingConferences() {
  const [conferences, setConferences] = useState<HTConference[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
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
        <Header
          title="Upcoming Conferences"
          count={undefined}
          id="upcoming-mini"
        />
        <div className="grid items-stretch gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-full rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 animate-pulse"
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
      <Header
        title="Upcoming Conferences"
        count={conferences.length}
        id="upcoming-mini"
      />
      <div className="grid items-stretch gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {conferences.map((c) => (
          <div key={c.id} className="h-full">
            <ConferenceCard conference={c} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Header({
  title,
  count,
  id,
}: {
  title: string;
  count?: number;
  id: string;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2
          id={`${id}-title`}
          className="group inline-flex items-center gap-2 text-base sm:text-lg font-semibold text-neutral-100"
        >
          {title}
          {typeof count === "number" && (
            <span className="rounded-full bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5">
              {count}
            </span>
          )}
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-neutral-300"
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
    <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-6 text-neutral-400">
      <svg
        className="h-5 w-5 shrink-0 text-neutral-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18M12 21c-4.5-5.5-6.75-9-6.75-11.25a6.75 6.75 0 1113.5 0c0 2.25-2.25 5.75-6.75 11.25z"
        />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
