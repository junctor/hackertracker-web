<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";

import AppIcon from "../components/AppIcon.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { formatDateRange, toDate } from "../lib/dates";
import { resolveMenuItems } from "../lib/menuRoutes";
import type { MenuRouteKey } from "../lib/menuRoutes";
import { parseNumericParam } from "../lib/routes";

const route = useRoute();
const { conference, menus, menu, menuItems, menuLoading, menuError } = useConferenceContext();
const requestedMenuId = computed(() => {
  if (route.name === "readme") {
    const readme = menu.value?.items.find(
      (item) => item.function === "menu" && item.titleText.toLowerCase() === "readme.nfo",
    );
    return readme?.menuId ?? undefined;
  }
  return parseNumericParam(route.params.menuId);
});
const activeMenu = computed(() =>
  requestedMenuId.value
    ? (menus.value.find((item) => item.id === requestedMenuId.value) ?? null)
    : menu.value,
);
const items = computed(() =>
  conference.value && activeMenu.value
    ? requestedMenuId.value
      ? resolveMenuItems(conference.value.code, activeMenu.value.items)
      : menuItems.value
    : [],
);
const isHome = computed(() => !requestedMenuId.value);
const dateLabel = computed(() =>
  conference.value
    ? formatDateRange(
        toDate(conference.value.start_timestamp) ?? toDate(conference.value.start_date),
        toDate(conference.value.end_timestamp) ?? toDate(conference.value.end_date),
        conference.value.timezone,
      )
    : undefined,
);
const iconFor = (key: MenuRouteKey) => {
  if (key === "schedule") return "calendar" as const;
  if (key === "bookmarks") return "bookmark" as const;
  if (key === "people") return "people" as const;
  if (key === "search") return "search" as const;
  if (key === "locations" || key === "maps") return "pin" as const;
  return "info" as const;
};

watchEffect(() => {
  if (conference.value)
    document.title = `${activeMenu.value?.titleText || conference.value.name} · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="conference-menu container">
    <PageState v-if="menuLoading && !activeMenu" kind="loading" message="Loading menu..." />
    <PageState
      v-else-if="menuError"
      kind="error"
      title="We couldn't load this menu"
      :message="menuError"
    />
    <template v-else>
      <header class="menu-hero">
        <p class="kicker">{{ isHome ? "Conference menu" : activeMenu?.titleText }}</p>
        <h1 tabindex="-1">{{ isHome ? conference.name : activeMenu?.titleText }}</h1>
        <p v-if="isHome" class="description">
          {{
            conference.tagline_text ||
            conference.description ||
            "Find the schedule, people, maps, and conference resources."
          }}
        </p>
        <p v-else class="description">Resources and information from {{ conference.name }}.</p>
        <time v-if="isHome && dateLabel" class="date-pill">{{ dateLabel }}</time>
      </header>

      <nav v-if="items.length" :aria-label="`${activeMenu?.titleText || conference.name} sections`">
        <ul class="menu-grid">
          <li v-for="(item, index) in items" :key="item.id">
            <RouterLink
              class="menu-card focus-ring"
              :class="{ featured: index < 2 }"
              :to="item.href"
            >
              <span class="menu-card-icon"><AppIcon :name="iconFor(item.routeKey)" /></span>
              <strong>{{ item.titleText }}</strong>
              <span class="menu-card-arrow" aria-hidden="true">›</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
      <PageState
        v-else-if="activeMenu"
        kind="empty"
        title="Nothing here yet"
        message="This menu does not contain any sections supported by the web app."
      />
      <PageState
        v-else
        kind="error"
        title="Menu not found"
        message="This conference menu is not available."
      />
    </template>
  </section>
</template>

<style scoped>
.conference-menu {
  padding-block: clamp(2.5rem, 6vw, 4rem);
}
.menu-hero {
  max-width: 46rem;
  text-align: left;
}
.kicker {
  color: var(--accent-success);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
h1 {
  margin-top: var(--space-2);
  font-size: clamp(2.4rem, 8vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.98;
  text-wrap: balance;
}
.description {
  max-width: 40rem;
  margin-top: var(--space-4);
  color: var(--text-muted);
  font-size: clamp(1rem, 2vw, 1.125rem);
  text-wrap: pretty;
}
.date-pill {
  display: inline-flex;
  margin-top: var(--space-5);
  border: 1px solid color-mix(in oklab, var(--accent-success), transparent 70%);
  border-radius: var(--radius-pill);
  background: color-mix(in oklab, var(--accent-success), transparent 90%);
  padding: 0.35rem 0.75rem;
  color: color-mix(in oklab, var(--accent-success), white 12%);
  font-size: 0.8rem;
  font-weight: 700;
}
nav {
  margin-top: clamp(2rem, 6vw, 3rem);
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  list-style: none;
  gap: var(--space-4);
}
.menu-card {
  display: grid;
  min-height: 4.75rem;
  height: 100%;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  border: 1px solid color-mix(in oklab, var(--border), white 8%);
  border-radius: var(--radius-2);
  background: color-mix(in oklab, var(--surface-muted), transparent 42%);
  padding: var(--space-3) var(--space-4);
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.menu-card.featured {
  border-color: color-mix(in oklab, var(--accent-success), transparent 68%);
}
.menu-card:hover {
  border-color: color-mix(in oklab, var(--accent), transparent 52%);
  background: var(--surface-interactive);
}
.menu-card-icon,
.menu-card-arrow {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  color: var(--accent-success);
}
.menu-card-icon :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}
.menu-card-arrow {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: var(--text-subtle);
  font-size: 1.35rem;
}
.menu-card strong {
  font-size: 1rem;
  overflow-wrap: anywhere;
}
</style>
