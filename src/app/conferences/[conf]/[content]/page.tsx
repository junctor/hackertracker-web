import Main from "@/components/main/Main";
import Loading from "@/components/misc/Loading";
import { Suspense } from "react";
import confs from "../../../../../public/ht/index.json";

export default function Content({
  params,
}: {
  params: { conf: string; content: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <main>
        <Main conf={params.conf} content={params.content} />
      </main>
    </Suspense>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { conf: string; content: string };
}) {
  return {
    title: `${params.conf} | HackerTracker`,
  };
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
