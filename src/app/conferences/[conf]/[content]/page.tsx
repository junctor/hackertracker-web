import Main from "@/components/main/Main";
import Loading from "@/components/misc/Loading";
import { Suspense } from "react";
import confs from "../../../../../public/ht/index.json";
import Event from "@/components/event/Event";

export default function Content({
  params,
}: {
  params: { conf: string; content: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <main>
        {params.content === "event" ? (
          <Event confId={params.conf} />
        ) : (
          <Main conf={params.conf} />
        )}
      </main>
    </Suspense>
  );
}

export async function generateStaticParams() {
  const schedule = confs.map((conf: HTConference) => ({
    conf: conf.code,
    content: "schedule",
  }));

  const event = confs.map((conf: HTConference) => ({
    conf: conf.code,
    content: "event",
  }));

  return [...schedule, ...event];
}
