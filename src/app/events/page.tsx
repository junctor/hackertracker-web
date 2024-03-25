import Main from "@/components/main/Main";
import Loading from "@/components/misc/Loading";
import { Suspense } from "react";

export default function Event() {
  return (
    <Suspense fallback={<Loading />}>
      <main>
        <Main />
      </main>
    </Suspense>
  );
}
