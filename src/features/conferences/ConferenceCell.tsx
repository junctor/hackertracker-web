import * as React from "react";
import type { HTConference } from "@/types/db";
import { formatDateRange, toDate, tzAbbrev } from "@/lib/utils/dates";

export const ConferenceCard = React.memo(function ConferenceCard({
  conference,
}: {
  conference: HTConference;
}) {
  const start =
    toDate(conference.start_date) ?? toDate(conference.start_timestamp);
  const end = toDate(conference.end_date) ?? toDate(conference.end_timestamp);
  const range = formatDateRange(start, end, conference.timezone);
  const tz = tzAbbrev(conference.timezone);

  return (
    <article
      className="group block rounded-2xl border  p-5 shadow-sm transition
                 hover:-translate-y-0.5 hover:shadow-md focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-blue-500
                 border-neutral-800 bg-neutral-900"
      aria-label={conference.name}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate text-lg font-semibold text-neutral-100 group-hover:text-cyan-400 transition-colors">
          {conference.name}
        </h3>
      </div>

      {(range || tz) && (
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-300">
          {range && <time>{range}</time>}
          {range && tz && <span aria-hidden="true">•</span>}
          {tz && <span className="uppercase">{tz}</span>}
        </div>
      )}
    </article>
  );
});
