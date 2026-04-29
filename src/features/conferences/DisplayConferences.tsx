import { useMemo } from "react";

import type { HTConference } from "@/types/db";

import { type DateLike, toDate } from "@/lib/utils/dates";

import { ConferenceCard } from "./ConferenceCard";

function toMillis(value: DateLike): number {
  return toDate(value)?.getTime() ?? 0;
}

type ConferenceWithDates<T> = T & {
  start_timestamp?: DateLike;
  end_timestamp?: DateLike;
  start_date?: DateLike;
  end_date?: DateLike;
  start_timestamp_str?: DateLike;
  end_timestamp_str?: DateLike;
  begin_tsz?: DateLike;
  end_tsz?: DateLike;
  updated_at?: DateLike;
  updated_timestamp?: DateLike;
  updated_tsz?: DateLike;
  updated?: DateLike;
  modified?: DateLike;
};

const startMs = (c: ConferenceWithDates<HTConference>) =>
  toMillis(c.start_timestamp ?? c.start_timestamp_str ?? c.start_date ?? c.begin_tsz);

const endMs = (c: ConferenceWithDates<HTConference>) =>
  toMillis(c.end_timestamp ?? c.end_timestamp_str ?? c.end_date ?? c.end_tsz);

const updatedMs = (c: ConferenceWithDates<HTConference>) =>
  toMillis(
    c.updated_at ??
      c.updated_timestamp ??
      c.updated_tsz ??
      c.updated ??
      c.modified ??
      c.start_timestamp ??
      c.start_timestamp_str ??
      c.start_date,
  );

const updatedDate = (c: ConferenceWithDates<HTConference>) =>
  toDate(c.updated_at ?? c.updated_timestamp ?? c.updated_tsz ?? c.updated ?? c.modified);

const byStartAsc = (a: HTConference, b: HTConference) =>
  startMs(a as ConferenceWithDates<HTConference>) - startMs(b as ConferenceWithDates<HTConference>);

const byStartDesc = (a: HTConference, b: HTConference) =>
  startMs(b as ConferenceWithDates<HTConference>) - startMs(a as ConferenceWithDates<HTConference>);

const byUpdatedDesc = (a: HTConference, b: HTConference) =>
  updatedMs(b as ConferenceWithDates<HTConference>) -
  updatedMs(a as ConferenceWithDates<HTConference>);

export function DisplayConferences({ conferences }: { conferences: HTConference[] }) {
  const { upcoming, updated, past } = useMemo(() => {
    const now = Date.now();
    const future = conferences.filter((c) => {
      const conf = c as ConferenceWithDates<HTConference>;
      const endsAt = endMs(conf);
      const startsAt = startMs(conf);
      return (endsAt || startsAt) >= now;
    });
    const history = conferences.filter((c) => {
      const conf = c as ConferenceWithDates<HTConference>;
      const endsAt = endMs(conf);
      const startsAt = startMs(conf);
      return (endsAt || startsAt) < now;
    });

    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

    const recent = [...conferences]
      .filter((c) => {
        const updated = updatedMs(c as ConferenceWithDates<HTConference>);
        return updated && Date.now() - updated <= THIRTY_DAYS;
      })
      .sort(byUpdatedDesc)
      .reduce<HTConference[]>((acc, c) => {
        if (!acc.find((x) => x.id === c.id)) acc.push(c);
        return acc;
      }, []);

    return {
      upcoming: future.sort(byStartAsc),
      updated: recent,
      past: history.sort(byStartDesc),
    };
  }, [conferences]);

  return (
    <div className="my-10 space-y-10">
      {/* Upcoming */}
      <Section
        id="upcoming"
        title="Upcoming Conferences"
        count={upcoming.length}
        ariaLabel="Upcoming conferences"
      >
        {upcoming.length ? (
          <CardsGrid>
            {upcoming.map((c) => (
              <CardWrap key={c.id}>
                <ConferenceCard conference={c} />
              </CardWrap>
            ))}
          </CardsGrid>
        ) : (
          <EmptyState message="No upcoming conferences found." />
        )}
      </Section>

      {/* Recently Updated */}
      <Section
        id="updated"
        title="Recently Updated"
        count={updated.length}
        ariaLabel="Recently updated conferences"
      >
        {updated.length ? (
          <CardsGrid>
            {updated.map((c) => (
              <CardWrap key={c.id}>
                <ConferenceCard
                  conference={c}
                  updatedAt={updatedDate(c as ConferenceWithDates<HTConference>)}
                />
              </CardWrap>
            ))}
          </CardsGrid>
        ) : (
          <EmptyState message="No recent updates." />
        )}
      </Section>

      {/* Past */}
      <Section id="past" title="Past Conferences" count={past.length} ariaLabel="Past conferences">
        {past.length ? (
          <CardsGrid>
            {past.map((c) => (
              <CardWrap key={c.id}>
                <ConferenceCard conference={c} />
              </CardWrap>
            ))}
          </CardsGrid>
        ) : (
          <EmptyState message="No past conferences found." />
        )}
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} role="region" aria-labelledby={`${id}-title`} className="space-y-4">
      <header className="flex items-center justify-between">
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
            className="ui-focus-ring rounded text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-300 focus-visible:opacity-100 focus-visible:outline-none"
            aria-label={`Link to section ${title}`}
          >
            #
          </a>
        </h2>
      </header>

      <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

      {children}
    </section>
  );
}

function CardsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}

function CardWrap({ children }: { children: React.ReactNode }) {
  return <div className="h-full">{children}</div>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="ui-empty-state text-neutral-300">
      <p className="text-sm">{message}</p>
    </div>
  );
}
