import { useMemo } from "react";
import type { HTConference } from "@/types/db";
import { ConferenceCard } from "./ConferenceCard";

/** Firestore / date helpers */
type FirestoreTimestampLike = { toDate: () => Date };
type DateLike =
  | Date
  | string
  | number
  | FirestoreTimestampLike
  | null
  | undefined;

function isFirestoreTimestamp(v: unknown): v is FirestoreTimestampLike {
  return typeof (v as { toDate?: unknown })?.toDate === "function";
}
function toMillis(value: DateLike): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return new Date(value).getTime();
  if (isFirestoreTimestamp(value)) return value.toDate().getTime();
  return 0;
}

type ConferenceWithDates<T> = T & {
  start_timestamp?: DateLike;
  start_date?: DateLike;
  updated_at?: DateLike;
  modified?: DateLike;
};

const startMs = (c: ConferenceWithDates<HTConference>) =>
  toMillis(c.start_timestamp ?? c.start_date);

const updatedMs = (c: ConferenceWithDates<HTConference>) =>
  toMillis(c.updated_at ?? c.modified ?? c.start_timestamp ?? c.start_date);

const byStartAsc = (a: HTConference, b: HTConference) =>
  startMs(a as ConferenceWithDates<HTConference>) -
  startMs(b as ConferenceWithDates<HTConference>);

const byStartDesc = (a: HTConference, b: HTConference) =>
  startMs(b as ConferenceWithDates<HTConference>) -
  startMs(a as ConferenceWithDates<HTConference>);

const byUpdatedDesc = (a: HTConference, b: HTConference) =>
  updatedMs(b as ConferenceWithDates<HTConference>) -
  updatedMs(a as ConferenceWithDates<HTConference>);

export function DisplayConferences({
  conferences,
}: {
  conferences: HTConference[];
}) {
  const { upcoming, updated, past } = useMemo(() => {
    const now = Date.now();
    const future = conferences.filter(
      (c) => startMs(c as ConferenceWithDates<HTConference>) >= now
    );
    const history = conferences.filter(
      (c) => startMs(c as ConferenceWithDates<HTConference>) < now
    );

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
                <ConferenceCard conference={c} />
              </CardWrap>
            ))}
          </CardsGrid>
        ) : (
          <EmptyState message="No recent updates." />
        )}
      </Section>

      {/* Past */}
      <Section
        id="past"
        title="Past Conferences"
        count={past.length}
        ariaLabel="Past conferences"
      >
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
    <section
      id={id}
      role="region"
      aria-labelledby={`${id}-title`}
      className="space-y-4"
    >
      <header className="flex items-center justify-between">
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
      </header>

      <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

      {children}
    </section>
  );
}

function CardsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-stretch gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}

function CardWrap({ children }: { children: React.ReactNode }) {
  return <div className="h-full">{children}</div>;
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
