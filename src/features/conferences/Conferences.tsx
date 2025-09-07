import { useEffect, useState } from "react";
import type { HTConference } from "@/types/db";
import { getConferences } from "@/lib/db";
import { DisplayConferences } from "./DisplayConferences";
import { HTHeader } from "@/components/HTHeader";
import { HTFooter } from "@/components/HTFooter";

export function Conferences() {
  const [conferences, setConferences] = useState<HTConference[]>([]);

  useEffect(() => {
    document.title = "Conferences · Hacker Tracker";
    (async () => setConferences(await getConferences(500)))();
  }, []);

  return (
    <>
      <HTHeader />
      <div className="mx-10 mt-10">
        <h2 className="text-xl font-semibold text-white">Conferences</h2>
        <DisplayConferences conferences={conferences} />
      </div>
      <HTFooter />
    </>
  );
}
