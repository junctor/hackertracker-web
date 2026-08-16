import { createRouter, createWebHistory } from "vue-router";

import { bookmarksPath, contentPath, peoplePath, personPath, schedulePath } from "../lib/routes";

const integer = (value: unknown): number | null =>
  typeof value === "string" && /^\d+$/.test(value) ? Number(value) : null;

function legacyRedirect(to: { path: string; query: Record<string, unknown> }) {
  const code = to.query.conf ?? to.query.conference;
  if (typeof code !== "string" || !code) return { name: "not-found" };
  const contentId = integer(to.query.event ?? to.query.content ?? to.query.id);
  const personId = integer(to.query.person ?? to.query.id);
  if (to.path === "/schedule") return schedulePath(code);
  if (to.path === "/bookmarks") return bookmarksPath(code);
  if (to.path === "/people" || to.path === "/people/")
    return personId ? personPath(code, personId) : peoplePath(code);
  if (to.path === "/person") return personId ? personPath(code, personId) : { name: "not-found" };
  return contentId ? contentPath(code, contentId) : { name: "not-found" };
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
  routes: [
    { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
    {
      path: "/conferences",
      name: "conferences",
      component: () => import("../views/ConferencesView.vue"),
    },
    { path: "/schedule", redirect: legacyRedirect },
    { path: "/bookmarks", redirect: legacyRedirect },
    { path: "/people", redirect: legacyRedirect },
    { path: "/people/", redirect: legacyRedirect },
    { path: "/person", redirect: legacyRedirect },
    { path: "/event", redirect: legacyRedirect },
    { path: "/content", redirect: legacyRedirect },
    { path: "/content/", redirect: legacyRedirect },
    {
      path: "/:confCode",
      name: "conference",
      component: () => import("../views/ScheduleView.vue"),
    },
    {
      path: "/:confCode/schedule",
      name: "schedule",
      component: () => import("../views/ScheduleView.vue"),
    },
    {
      path: "/:confCode/bookmarks",
      name: "bookmarks",
      component: () => import("../views/BookmarksView.vue"),
    },
    {
      path: "/:confCode/people",
      name: "people",
      component: () => import("../views/PeopleView.vue"),
    },
    {
      path: "/:confCode/people/:personId",
      name: "person",
      component: () => import("../views/PersonView.vue"),
    },
    {
      path: "/:confCode/content/:contentId",
      name: "content",
      component: () => import("../views/ContentView.vue"),
    },
    {
      path: "/:confCode/event/:contentId",
      redirect: (to) => {
        const id = integer(to.params.contentId);
        return typeof to.params.confCode === "string" && id
          ? contentPath(to.params.confCode, id)
          : { name: "not-found" };
      },
    },
    { path: "/about", name: "about", component: () => import("../views/AboutView.vue") },
    { path: "/support", name: "support", component: () => import("../views/SupportView.vue") },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

router.afterEach(() => {
  window.requestAnimationFrame(() => {
    const heading = document.querySelector("main h1") as HTMLElement | null;
    heading?.focus({ preventScroll: true });
  });
});

export default router;
