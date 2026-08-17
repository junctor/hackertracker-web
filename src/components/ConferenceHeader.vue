<script setup lang="ts">
import { Bookmark, Calendar, Info, MapPin, Menu, Search, Users } from "@lucide/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import type { Conference } from "../types/hackertracker";
import type { MenuRouteKey, SupportedMenuItem } from "../lib/menuRoutes";

import { conferenceMenuPath } from "../lib/routes";

const props = defineProps<{ conference: Conference; items: SupportedMenuItem[] }>();
const route = useRoute();
const open = ref(false);
const menu = ref<HTMLElement | null>(null);

const iconFor = (key: MenuRouteKey) => {
  if (key === "schedule") return Calendar;
  if (key === "bookmarks") return Bookmark;
  if (key === "people") return Users;
  if (key === "search") return Search;
  if (key === "locations" || key === "maps") return MapPin;
  return Info;
};
const schedule = computed(() => props.items.find((item) => item.routeKey === "schedule"));
const search = computed(() => props.items.find((item) => item.routeKey === "search"));
const isActive = (href: string) => {
  const current = route.path.replace(/\/$/, "");
  const target = href.replace(/\/$/, "");
  return current === target || current.startsWith(`${target}/`);
};

function closeOutside(event: PointerEvent): void {
  if (open.value && menu.value && !menu.value.contains(event.target as Node)) open.value = false;
}
function closeOnEscape(event: KeyboardEvent): void {
  if (event.key !== "Escape" || !open.value) return;
  open.value = false;
  menu.value?.querySelector<HTMLButtonElement>("button")?.focus();
}
watch(
  () => route.fullPath,
  () => (open.value = false),
);
onMounted(() => {
  document.addEventListener("pointerdown", closeOutside);
  document.addEventListener("keydown", closeOnEscape);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeOutside);
  document.removeEventListener("keydown", closeOnEscape);
});
</script>

<template>
  <header class="conference-header">
    <a class="skip-link focus-ring" href="#main">Skip to content</a>
    <div class="header-rule" aria-hidden="true" />
    <div class="header-inner container">
      <div class="brand-group">
        <RouterLink class="home-link focus-ring" to="/" aria-label="Hacker Tracker home">
          <img src="/images/logos/ht-logo.png" alt="" />
        </RouterLink>
        <RouterLink
          class="conference-brand focus-ring"
          :to="conferenceMenuPath(conference.code)"
          :aria-label="`${conference.name} home`"
        >
          {{ conference.name }}
        </RouterLink>
      </div>

      <div class="header-actions">
        <RouterLink
          v-if="schedule"
          class="action-link focus-ring"
          :class="{ active: isActive(schedule.href) }"
          :to="schedule.href"
          :aria-current="isActive(schedule.href) ? 'page' : undefined"
        >
          <Calendar aria-hidden="true" /><span>Schedule</span>
        </RouterLink>
        <RouterLink
          v-if="search"
          class="icon-link focus-ring"
          :to="search.href"
          :aria-current="isActive(search.href) ? 'page' : undefined"
          :aria-label="`Search ${conference.name}`"
        >
          <Search aria-hidden="true" />
        </RouterLink>

        <div ref="menu" class="menu-wrap">
          <button
            class="menu-button focus-ring"
            type="button"
            :aria-expanded="open"
            aria-controls="conference-menu"
            @click.stop="open = !open"
          >
            <Menu aria-hidden="true" /><span>Menu</span>
          </button>
          <nav v-if="open" id="conference-menu" class="menu-popover" aria-label="Conference">
            <ul>
              <li v-for="item in items" :key="item.id">
                <RouterLink
                  class="menu-item focus-ring"
                  :class="{ active: isActive(item.href) }"
                  :to="item.href"
                  :aria-current="isActive(item.href) ? 'page' : undefined"
                >
                  <span class="menu-icon"
                    ><component :is="iconFor(item.routeKey)" aria-hidden="true"
                  /></span>
                  <span>{{ item.titleText }}</span>
                </RouterLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.conference-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-chrome);
  background: var(--color-bg);
}

.header-rule {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklab, var(--accent), transparent 65%),
    transparent
  );
}

.header-inner,
.brand-group,
.header-actions,
.action-link,
.icon-link,
.menu-button,
.menu-item {
  display: flex;
  align-items: center;
}

.header-inner {
  min-height: 4rem;
  justify-content: space-between;
  gap: var(--space-3);
  padding-block: 0.625rem;
}

.brand-group {
  min-width: 0;
  gap: var(--space-2);
}
.home-link,
.icon-link {
  display: grid;
  width: var(--control-min);
  min-width: var(--control-min);
  height: var(--control-min);
  place-items: center;
  border-radius: 0.75rem;
  color: var(--text-muted);
}
.home-link svg,
.icon-link svg,
.action-link svg,
.menu-button svg {
  width: 1.25rem;
  height: 1.25rem;
}
.home-link img {
  width: 1.75rem;
  height: 1.75rem;
  image-rendering: pixelated;
}
.home-link:hover,
.icon-link:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}
.conference-brand {
  min-width: 0;
  overflow: hidden;
  border-radius: 0.75rem;
  padding: 0.4rem var(--space-2);
  color: var(--text-primary);
  font-family: inherit;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conference-brand:hover {
  background: rgb(255 255 255 / 0.04);
  color: white;
}
.header-actions {
  flex-shrink: 0;
  gap: var(--space-1);
  margin-left: auto;
}
.action-link,
.menu-button {
  min-height: var(--control-min);
  gap: var(--space-2);
  border-radius: 0.75rem;
  padding-inline: 0.65rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 650;
}
.action-link:hover,
.action-link.active,
.menu-button:hover,
.menu-button[aria-expanded="true"] {
  background: var(--surface-muted);
  color: color-mix(in oklab, var(--accent-success), white 14%);
}
.menu-wrap {
  position: relative;
}
.menu-popover {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  width: min(24rem, calc(100vw - 2rem));
  max-height: min(36rem, calc(100dvh - 6rem));
  overflow: auto;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-3);
  background: color-mix(in oklab, var(--color-bg), black 20%);
  padding: var(--space-2);
  box-shadow: var(--shadow-lg);
}
.menu-popover ul {
  display: grid;
  list-style: none;
  gap: 0.2rem;
}
.menu-item {
  min-height: var(--control-min);
  gap: var(--space-3);
  border-radius: var(--radius-2);
  padding: 0.65rem 0.75rem;
  color: var(--text-muted);
  font-weight: 650;
}
.menu-item:hover,
.menu-item.active {
  background: var(--surface-interactive);
  color: var(--text-primary);
}
.menu-icon {
  display: grid;
  width: 1.8rem;
  place-items: center;
  color: var(--accent-success);
}
.menu-icon :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
}
@media (width < 40rem) {
  .home-link {
    display: none;
  }
  .brand-group {
    flex: 1 1 auto;
  }
  .conference-brand {
    padding-inline: 0;
    font-size: 1rem;
  }
  .action-link span,
  .menu-button span {
    display: none;
  }
  .action-link,
  .menu-button {
    min-width: var(--control-min);
    justify-content: center;
    padding: 0;
  }
}
</style>
