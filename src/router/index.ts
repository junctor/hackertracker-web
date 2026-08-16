import { createRouter, createWebHistory } from "vue-router";

import { conferenceMenuPath } from "../lib/routes";

const directoryChildren = [
  "communities",
  "contests",
  "departments",
  "exhibitors",
  "organizations",
  "vendors",
  "villages",
].flatMap((section) => [
  {
    path: section,
    name: section,
    component: () => import("../views/OrganizationDirectoryView.vue"),
    meta: { section },
  },
  {
    path: `${section}/:organizationId`,
    name: `${section}-detail`,
    component: () => import("../views/OrganizationDirectoryView.vue"),
    meta: { section },
  },
]);

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
    { path: "/about", name: "about", component: () => import("../views/AboutView.vue") },
    { path: "/support", name: "support", component: () => import("../views/SupportView.vue") },
    {
      path: "/:confCode",
      component: () => import("../layouts/ConferenceLayout.vue"),
      children: [
        { path: "", redirect: (to) => conferenceMenuPath(String(to.params.confCode)) },
        {
          path: "menu",
          name: "conference-menu",
          component: () => import("../views/ConferenceMenuView.vue"),
        },
        {
          path: "menu/:menuId",
          name: "nested-menu",
          component: () => import("../views/ConferenceMenuView.vue"),
        },
        {
          path: "readme.nfo",
          name: "readme",
          component: () => import("../views/ConferenceMenuView.vue"),
        },
        {
          path: "announcements",
          name: "announcements",
          component: () => import("../views/AnnouncementsView.vue"),
        },
        {
          path: "schedule",
          name: "schedule",
          component: () => import("../views/ScheduleView.vue"),
        },
        {
          path: "bookmarks",
          name: "bookmarks",
          component: () => import("../views/BookmarksView.vue"),
        },
        {
          path: "content",
          name: "content-list",
          component: () => import("../views/ContentListView.vue"),
        },
        {
          path: "content/:contentId",
          name: "content-detail",
          component: () => import("../views/ContentView.vue"),
        },
        { path: "people", name: "people", component: () => import("../views/PeopleView.vue") },
        {
          path: "people/:personId",
          name: "person",
          component: () => import("../views/PersonView.vue"),
        },
        {
          path: "locations",
          name: "locations",
          component: () => import("../views/LocationsView.vue"),
        },
        { path: "maps", name: "maps", component: () => import("../views/MapsView.vue") },
        { path: "search", name: "search", component: () => import("../views/SearchView.vue") },
        {
          path: "documents/:documentId",
          name: "document",
          component: () => import("../views/DocumentView.vue"),
        },
        ...directoryChildren,
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

export default router;
