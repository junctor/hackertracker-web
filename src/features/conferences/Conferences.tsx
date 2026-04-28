import { useEffect, useState } from "react";

import type { HTConference } from "@/types/db";

import { HTFooter } from "@/components/HTFooter";
import { HTHeader } from "@/components/HTHeader";
import { getConferences } from "@/lib/db";

import { DisplayConferences } from "./DisplayConferences";

export function Conferences() {
  const [conferences, setConferences] = useState<HTConference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Conferences · Hacker Tracker";
    void (async () => {
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
      <main className="mt-10 px-4 sm:px-6 lg:px-10">
        <header className="mb-6 space-y-3">
          <h1 className="text-xl font-semibold text-neutral-100">Conferences</h1>
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
        </header>

        {loading ? (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[116px] animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900/60"
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
