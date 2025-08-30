import { getConferences } from "@/lib/db";
import { useEffect, useState } from "react";
import { type HTConference } from "@/types/db";
import { ConferenceCard } from "./ConferenceCell";

export function Conferences({ count = 100 }: { count?: number }) {
  const [conferences, setConferences] = useState<HTConference[]>([]);

  useEffect(() => {
    const fetchConferences = async () => {
      const conferences = await getConferences(count);
      setConferences(conferences);
    };

    fetchConferences();
  }, [count]);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-rows:1fr]">
        {conferences.map((c) => (
          <ConferenceCard key={c.id} conference={c} />
        ))}
      </div>
    </div>
  );
}
