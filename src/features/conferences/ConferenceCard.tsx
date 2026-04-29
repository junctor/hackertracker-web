import * as React from "react";
import { Link } from "react-router";

import type { HTConference } from "@/types/db";

import { formatDateRange, toDate, tzAbbrev } from "@/lib/utils/dates";

export const ConferenceCard = React.memo(function ConferenceCard({
  conference,
  updatedAt,
}: {
  conference: HTConference;
  updatedAt?: Date;
}) {
  const start = toDate(conference.start_timestamp) ?? toDate(conference.start_date);
  const end = toDate(conference.end_timestamp) ?? toDate(conference.end_date);
  const range = formatDateRange(start, end, conference.timezone);
  const tz = tzAbbrev(conference.timezone);
  const updatedLabel = updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(updatedAt)
    : undefined;

  return (
    <Link
      to={`/schedule?conf=${conference.code}`}
      className="ui-focus-ring group block h-full rounded-[0.875rem] focus-visible:outline-none"
    >
      <article className="ui-card ui-card-interactive flex h-full min-h-[7.25rem] flex-col p-5 transition group-hover:shadow-md">
        <h3
          className="line-clamp-2 min-h-[2.75rem] text-lg leading-snug font-semibold break-words text-neutral-100 transition-colors group-hover:text-white"
          title={conference.name}
        >
          {conference.name}
        </h3>

        {(range || tz) && (
          <p className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-neutral-300">
            {range && <time>{range}</time>}
            {range && tz && <span aria-hidden="true">•</span>}
            {tz && <span className="uppercase">{tz}</span>}
          </p>
        )}

        {updatedAt && updatedLabel && (
          <p className="mt-2 text-xs font-medium text-neutral-500">
            Updated <time dateTime={updatedAt.toISOString()}>{updatedLabel}</time>
          </p>
        )}
      </article>
    </Link>
  );
});
