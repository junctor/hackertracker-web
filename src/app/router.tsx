import { Suspense, lazy } from "react";
import { Navigate, Routes, Route, useLocation, useParams } from "react-router";

import LoadingPage from "@/components/LoadingPage";
import NotFound from "@/components/NotFound";
import {
  bookmarksPath,
  contentPath,
  peoplePath,
  personPath,
  schedulePath,
} from "@/lib/utils/routes";

const SplashRoute = lazy(() =>
  import("../features/splash/Splash").then((module) => ({
    default: module.Splash,
  })),
);

const ConferencesRoute = lazy(() =>
  import("../features/conferences/Conferences").then((module) => ({
    default: module.Conferences,
  })),
);

const AboutRoute = lazy(() =>
  import("../pages/About").then((module) => ({
    default: module.About,
  })),
);

const SupportRoute = lazy(() =>
  import("../pages/Support").then((module) => ({
    default: module.Support,
  })),
);

const ScheduleRoute = lazy(() =>
  import("../features/schedule/Schedule").then((module) => ({
    default: module.Schedule,
  })),
);

const BookmarksRoute = lazy(() =>
  import("../features/bookmarks/Bookmarks").then((module) => ({
    default: module.Bookmarks,
  })),
);

const ContentRoute = lazy(() =>
  import("../features/content/Content").then((module) => ({
    default: module.ContentDetailPage,
  })),
);

const PeopleRoute = lazy(() =>
  import("../features/people/People").then((module) => ({
    default: module.People,
  })),
);

const PersonRoute = lazy(() =>
  import("../features/person/Person").then((module) => ({
    default: module.Person,
  })),
);

function parseLegacyId(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}

function LegacyRedirect() {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const confCode = params.get("conf") ?? params.get("conference");
  const contentId = parseLegacyId(params.get("event") ?? params.get("content") ?? params.get("id"));
  const personId = parseLegacyId(params.get("person") ?? params.get("id"));

  if (!confCode) return <NotFound />;

  if (
    pathname === "/event" ||
    pathname === "/event/" ||
    pathname === "/content" ||
    pathname === "/content/"
  ) {
    return contentId ? <Navigate replace to={contentPath(confCode, contentId)} /> : <NotFound />;
  }

  if (pathname === "/schedule") {
    return <Navigate replace to={schedulePath(confCode)} />;
  }

  if (pathname === "/bookmarks") {
    return <Navigate replace to={bookmarksPath(confCode)} />;
  }

  if (pathname === "/people" || pathname === "/people/") {
    return (
      <Navigate replace to={personId ? personPath(confCode, personId) : peoplePath(confCode)} />
    );
  }

  if (pathname === "/person") {
    return personId ? <Navigate replace to={personPath(confCode, personId)} /> : <NotFound />;
  }

  return <NotFound />;
}

function LegacyContentRedirect() {
  const { confCode, contentId } = useParams();
  const parsedContentId = contentId && /^\d+$/.test(contentId) ? Number(contentId) : null;
  if (!confCode || !parsedContentId) return <NotFound />;
  return <Navigate replace to={contentPath(confCode, parsedContentId)} />;
}

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
          <Suspense fallback={<LoadingPage message="Loading conferences..." />}>
            <ConferencesRoute />
          </Suspense>
        }
      />
      <Route path="/schedule" element={<LegacyRedirect />} />
      <Route path="/bookmarks" element={<LegacyRedirect />} />
      <Route path="/people" element={<LegacyRedirect />} />
      <Route path="/people/" element={<LegacyRedirect />} />
      <Route path="/person" element={<LegacyRedirect />} />
      <Route path="/event" element={<LegacyRedirect />} />
      <Route path="/content" element={<LegacyRedirect />} />
      <Route path="/content/" element={<LegacyRedirect />} />
      <Route
        path="/:confCode"
        element={
          <Suspense fallback={<LoadingPage message="Loading schedule..." />}>
            <ScheduleRoute />
          </Suspense>
        }
      />
      <Route
        path="/:confCode/schedule"
        element={
          <Suspense fallback={<LoadingPage message="Loading schedule..." />}>
            <ScheduleRoute />
          </Suspense>
        }
      />
      <Route
        path="/:confCode/bookmarks"
        element={
          <Suspense fallback={<LoadingPage message="Loading bookmarks..." />}>
            <BookmarksRoute />
          </Suspense>
        }
      />
      <Route
        path="/:confCode/people"
        element={
          <Suspense fallback={<LoadingPage message="Loading people..." />}>
            <PeopleRoute />
          </Suspense>
        }
      />
      <Route
        path="/:confCode/people/:personId"
        element={
          <Suspense fallback={<LoadingPage message="Loading person..." />}>
            <PersonRoute />
          </Suspense>
        }
      />
      <Route
        path="/:confCode/content/:contentId"
        element={
          <Suspense fallback={<LoadingPage message="Loading content..." />}>
            <ContentRoute />
          </Suspense>
        }
      />
      <Route path="/:confCode/event/:contentId" element={<LegacyContentRedirect />} />
      <Route
        path="/about"
        element={
          <Suspense fallback={<LoadingPage message="Loading about..." />}>
            <AboutRoute />
          </Suspense>
        }
      />
      <Route
        path="/support"
        element={
          <Suspense fallback={<LoadingPage message="Loading support..." />}>
            <SupportRoute />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
