import { useMemo } from "react";
import type { HTConference } from "@/types/db";
import { ConferenceCard } from "./ConferenceCell";

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
    return {
      upcoming: future.sort(byStartAsc),
      updated: [...conferences].sort(byUpdatedDesc).slice(0, 8),
      past: history.sort(byStartDesc),
    };
  }, [conferences]);

  return (
    <div className="space-y-8 my-10">
      {/* Upcoming */}
      <section id="upcoming" className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-200">
          Upcoming Conferences
        </h2>
        {upcoming.length ? (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-rows:1fr]">
            {upcoming.map((c) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No upcoming conferences found.</p>
        )}
      </section>

      {/* Recently Updated */}
      <section id="updated" className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-200">
          Recently Updated
        </h2>
        {updated.length ? (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-rows:1fr]">
            {updated.map((c) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No recent updates.</p>
        )}
      </section>

      {/* Past */}
      <section id="past" className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-200">
          Past Conferences
        </h2>
        {past.length ? (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-rows:1fr]">
            {past.map((c) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No past conferences found.</p>
        )}
      </section>
    </div>
  );
}
