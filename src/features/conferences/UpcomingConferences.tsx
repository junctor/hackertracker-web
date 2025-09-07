import { getUpcomingConferences } from "@/lib/db";
import { useEffect, useState } from "react";
import { type HTConference } from "@/types/db";
import { ConferenceCard } from "./ConferenceCell";

export function UpcomingConferences() {
  const [conferences, setConferences] = useState<HTConference[]>([]);

  useEffect(() => {
    const fetchConferences = async () => {
      const conferences = await getUpcomingConferences();
      setConferences(conferences);
    };

    fetchConferences();
  }, []);

  return conferences.length > 0 ? (
    <div>
      <h2 className="mb-4 text-left text-lg font-semibold text-neutral-200">
        Upcoming Conferences
      </h2>
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-rows:1fr]">
        {conferences.map((c) => (
          <ConferenceCard key={c.id} conference={c} />
        ))}
      </div>
    </div>
  ) : null;
}
