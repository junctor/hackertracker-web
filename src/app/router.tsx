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

const BookmarksRoute = lazy(() =>
  import("../features/bookmarks/Bookmarks").then((module) => ({
    default: module.Bookmarks,
  }))
);

const EventRoute = lazy(() =>
  import("../features/event/Event").then((module) => ({
    default: module.Event,
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
        path="/bookmarks"
        element={
          <Suspense fallback={<LoadingPage />}>
            <BookmarksRoute />
          </Suspense>
        }
      />
      <Route
        path="/event"
        element={
          <Suspense fallback={<LoadingPage />}>
            <EventRoute />
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
