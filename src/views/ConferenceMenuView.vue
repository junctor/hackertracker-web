<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";

import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { formatDateRange, toDate } from "../lib/dates";
import { menuIcon } from "../lib/menuIcons";
import { resolveMenuItems } from "../lib/menuRoutes";
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
watchEffect(() => {
  if (conference.value)
    document.title = `${activeMenu.value?.titleText || conference.value.name} · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="conference-menu container">
    <PageState
      v-if="menuLoading && !activeMenu"
      kind="loading"
      message="Getting the conference menu…"
    />
    <PageState
      v-else-if="menuError"
      kind="error"
      title="Conference menu unavailable"
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
        <time v-if="isHome && dateLabel" class="date-label">{{ dateLabel }}</time>
      </header>

      <nav v-if="items.length" :aria-label="`${activeMenu?.titleText || conference.name} sections`">
        <ul class="menu-grid">
          <li v-for="item in items" :key="item.id">
            <RouterLink class="menu-button-link focus-ring" :to="item.href">
              <component :is="menuIcon(item.routeKey)" aria-hidden="true" />
              <strong>{{ item.titleText }}</strong>
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
.date-label {
  display: block;
  margin-top: var(--space-5);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 650;
}
nav {
  margin-top: clamp(2rem, 6vw, 3rem);
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  list-style: none;
  column-gap: var(--space-6);
}
.menu-button-link {
  display: grid;
  min-height: var(--control-min);
  height: 100%;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-3);
  border-bottom: 1px solid var(--border);
  padding: 0.9rem var(--space-2);
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.menu-button-link:hover {
  border-color: color-mix(in oklab, var(--accent), transparent 40%);
  background: transparent;
  color: white;
}
.menu-button-link > svg {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--accent-success);
}
.menu-button-link strong {
  font-size: 1rem;
  overflow-wrap: anywhere;
}
</style>
