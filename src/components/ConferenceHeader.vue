<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import type { Conference } from "../types/hackertracker";

import { bookmarksPath, conferencePath, peoplePath, schedulePath } from "../lib/routes";
import AppIcon from "./AppIcon.vue";

const props = defineProps<{ conference: Conference }>();
const route = useRoute();
const open = ref(false);
const scrolled = ref(false);
const menu = ref<HTMLElement | null>(null);

interface NavigationItem {
  label: string;
  to: string;
  icon: "bookmark" | "calendar" | "external" | "home" | "people";
  active: boolean;
}

const items = computed<NavigationItem[]>(() => {
  const code = props.conference.code;
  const current = route.path.toLowerCase().replace(/\/+$/, "") || "/";
  const root = conferencePath(code);
  const schedule = schedulePath(code);
  const bookmarks = bookmarksPath(code);
  const people = peoplePath(code);
  const result: NavigationItem[] = [
    {
      label: "Schedule",
      to: schedule,
      icon: "calendar" as const,
      active: current === root || current === schedule,
    },
    { label: "Bookmarks", to: bookmarks, icon: "bookmark" as const, active: current === bookmarks },
    {
      label: "People",
      to: people,
      icon: "people" as const,
      active: current === people || current.startsWith(`${people}/`),
    },
  ];
  if (props.conference.link)
    result.push({
      label: "Conference",
      to: props.conference.link,
      icon: "external" as const,
      active: false,
    });
  result.push({ label: "Home", to: "/", icon: "home" as const, active: false });
  return result;
});

function closeOutside(event: MouseEvent): void {
  if (open.value && menu.value && !menu.value.contains(event.target as Node)) open.value = false;
}
function updateScroll(): void {
  scrolled.value = window.scrollY > 8;
}
watch(
  () => route.fullPath,
  () => (open.value = false),
);
onMounted(() => {
  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
  document.addEventListener("click", closeOutside);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScroll);
  document.removeEventListener("click", closeOutside);
});
</script>

<template>
  <header class="site-header" :class="{ 'site-header--scrolled': scrolled }">
    <a class="skip-link focus-ring" href="#main">Skip to content</a>
    <div class="header-inner">
      <RouterLink
        class="conference-brand focus-ring"
        :to="schedulePath(conference.code)"
        :aria-label="`${conference.name} — view schedule`"
      >
        {{ conference.name }}
      </RouterLink>
      <nav class="desktop-nav" aria-label="Conference navigation">
        <template v-for="item in items" :key="item.label">
          <a
            v-if="item.label === 'Conference'"
            class="nav-button focus-ring"
            :href="item.to"
            target="_blank"
            rel="noopener noreferrer"
            ><AppIcon :name="item.icon" /><span>{{ item.label }}</span></a
          >
          <RouterLink
            v-else
            class="nav-button focus-ring"
            :class="{ active: item.active }"
            :to="item.to"
            :aria-current="item.active ? 'page' : undefined"
            ><AppIcon :name="item.icon" /><span v-if="item.label !== 'Home'">{{
              item.label
            }}</span></RouterLink
          >
        </template>
      </nav>
      <div ref="menu" class="mobile-nav">
        <button
          class="icon-button focus-ring"
          type="button"
          :aria-expanded="open"
          aria-controls="conference-mobile-menu"
          :aria-label="open ? 'Close menu' : 'Open menu'"
          @click.stop="open = !open"
        >
          <AppIcon :name="open ? 'close' : 'menu'" />
        </button>
        <nav
          v-if="open"
          id="conference-mobile-menu"
          class="mobile-menu"
          aria-label="Conference navigation"
        >
          <template v-for="item in items" :key="item.label">
            <a
              v-if="item.label === 'Conference'"
              :href="item.to"
              target="_blank"
              rel="noopener noreferrer"
              class="mobile-menu-link focus-ring"
              ><AppIcon :name="item.icon" />{{ item.label }}</a
            >
            <RouterLink v-else :to="item.to" class="mobile-menu-link focus-ring">
              <AppIcon :name="item.icon" />{{ item.label }}
            </RouterLink>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>
