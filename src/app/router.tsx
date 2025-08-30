import { Routes, Route } from "react-router";

import { Suspense, lazy } from "react";

const SplashRoute = lazy(() =>
  import("../features/splash/Splash").then((module) => ({
    default: module.Splash,
  }))
);

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<>Loading…</>}>
            <SplashRoute />
          </Suspense>
        }
      />
    </Routes>
  );
}
