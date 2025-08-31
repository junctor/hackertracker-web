import { Routes, Route } from "react-router";

import { Suspense, lazy } from "react";

const SplashRoute = lazy(() =>
  import("../features/splash/Splash").then((module) => ({
    default: module.Splash,
  }))
);

const ConferencesRoute = lazy(() =>
  import("../features/conferences/Conferences").then((module) => ({
    default: module.Conferences,
  }))
);

const AboutRoute = lazy(() =>
  import("../pages/About").then((module) => ({
    default: module.About,
  }))
);

const SupportRoute = lazy(() =>
  import("../pages/Support").then((module) => ({
    default: module.Support,
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
      <Route
        path="/conferences"
        element={
          <Suspense fallback={<>Loading…</>}>
            <ConferencesRoute />
          </Suspense>
        }
      />
      <Route
        path="/about"
        element={
          <Suspense fallback={<>Loading…</>}>
            <AboutRoute />
          </Suspense>
        }
      />
      <Route
        path="/support"
        element={
          <Suspense fallback={<>Loading…</>}>
            <SupportRoute />
          </Suspense>
        }
      />
    </Routes>
  );
}
