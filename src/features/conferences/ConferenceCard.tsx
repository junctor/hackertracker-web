import * as React from "react";
import { Link } from "react-router";

import type { HTConference } from "@/types/db";

import { formatDateRange, toDate, tzAbbrev } from "@/lib/utils/dates";

export const ConferenceCard = React.memo(function ConferenceCard({
  conference,
}: {
  conference: HTConference;
}) {
  const start = toDate(conference.start_timestamp) ?? toDate(conference.start_date);
  const end = toDate(conference.end_timestamp) ?? toDate(conference.end_date);
  const range = formatDateRange(start, end, conference.timezone);
  const tz = tzAbbrev(conference.timezone);

  return (
    <Link to={`/schedule?conf=${conference.code}`} className="block h-full">
      <article
        className="h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label={conference.name}
      >
        <div className="flex h-full flex-col">
          {/* Title */}
          <h3
            className="line-clamp-2 min-h-[2.75rem] text-lg leading-snug font-semibold break-words text-neutral-100 transition-colors group-hover:text-cyan-400"
            title={conference.name}
          >
            {conference.name}
          </h3>

          {/* Meta */}
          {(range || tz) && (
            <div className="mt-2 text-xs text-neutral-300">
              {range && <time>{range}</time>}
              {range && tz && <span aria-hidden="true"> • </span>}
              {tz && <span className="uppercase">{tz}</span>}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
});
