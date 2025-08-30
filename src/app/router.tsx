import { Routes, Route } from "react-router";

import { Suspense, lazy } from "react";

const ConferenceRoute = lazy(() =>
  import("../features/conferences/Conferences").then((module) => ({
    default: module.Conferences,
  }))
);

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<>Loading…</>}>
            <ConferenceRoute />
          </Suspense>
        }
      />
    </Routes>
  );
}
