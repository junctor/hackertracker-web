import Event from "@/components/events/Event";
import Loading from "@/components/misc/Loading";
import { Suspense } from "react";

export default function Events() {
  return (
    <Suspense fallback={<Loading />}>
      <main className="">
        <Event />
      </main>
    </Suspense>
  );
}
