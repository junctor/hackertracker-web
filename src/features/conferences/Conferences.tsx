import { useEffect, useState } from "react";
import type { HTConference } from "@/types/db";
import { getConferences } from "@/lib/db";
import { DisplayConferences } from "./DisplayConferences";
import { HTHeader } from "@/components/HTHeader";
import { HTFooter } from "@/components/HTFooter";

export function Conferences() {
  const [conferences, setConferences] = useState<HTConference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Conferences · Hacker Tracker";
    (async () => {
      try {
        setLoading(true);
        const data = await getConferences(500);
        setConferences(data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <HTHeader />
      <main className="px-4 sm:px-6 lg:px-10 mt-10">
        <header className="space-y-3 mb-6">
          <h1 className="text-xl font-semibold text-neutral-100">
            Conferences
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
        </header>

        {loading ? (
          <div className="grid items-stretch gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[116px] rounded-2xl border border-neutral-800 bg-neutral-900/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <DisplayConferences conferences={conferences} />
        )}
      </main>
      <HTFooter />
    </>
  );
}
