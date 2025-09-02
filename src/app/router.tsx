import { Routes, Route } from "react-router";
import LoadingPage from "@/components/LoadingPage";

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

const ScheduleRoute = lazy(() =>
  import("../features/schedule/Schedule").then((module) => ({
    default: module.Schedule,
  }))
);

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingPage />}>
            <SplashRoute />
          </Suspense>
        }
      />
      <Route
        path="/conferences"
        element={
          <Suspense fallback={<LoadingPage />}>
            <ConferencesRoute />
          </Suspense>
        }
      />
      <Route
        path="/schedule"
        element={
          <Suspense fallback={<LoadingPage />}>
            <ScheduleRoute />
          </Suspense>
        }
      />
      <Route
        path="/about"
        element={
          <Suspense fallback={<LoadingPage />}>
            <AboutRoute />
          </Suspense>
        }
      />
      <Route
        path="/support"
        element={
          <Suspense fallback={<LoadingPage />}>
            <SupportRoute />
          </Suspense>
        }
      />
    </Routes>
  );
}
