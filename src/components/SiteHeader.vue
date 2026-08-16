<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import AppIcon from "./AppIcon.vue";

const route = useRoute();
const menuOpen = ref(false);
const scrolled = ref(false);
const menu = ref<HTMLElement | null>(null);

const items = [
  { label: "Conferences", to: "/conferences", icon: "calendar" as const },
  { label: "About", to: "/about", icon: "info" as const },
  { label: "Support", to: "/support", icon: "support" as const },
  {
    label: "GitHub",
    to: "https://github.com/junctor/hackertracker-web",
    icon: "github" as const,
    external: true,
  },
];

const headerClass = computed(() => ({ "site-header--scrolled": scrolled.value }));

function updateScroll(): void {
  scrolled.value = window.scrollY > 8;
}

function closeOnOutsideClick(event: MouseEvent): void {
  if (menuOpen.value && menu.value && !menu.value.contains(event.target as Node))
    menuOpen.value = false;
}

watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
);

onMounted(() => {
  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
  document.addEventListener("click", closeOnOutsideClick);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScroll);
  document.removeEventListener("click", closeOnOutsideClick);
});
</script>

<template>
  <header class="site-header" :class="headerClass">
    <a class="skip-link focus-ring" href="#main">Skip to content</a>
    <div class="header-inner">
      <RouterLink class="brand focus-ring" to="/" aria-label="Hacker Tracker Home">
        Hacker Tracker
      </RouterLink>

      <nav class="desktop-nav" aria-label="Main navigation">
        <template v-for="item in items" :key="item.label">
          <a
            v-if="item.external"
            class="nav-button focus-ring"
            :href="item.to"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppIcon :name="item.icon" />
            <span>{{ item.label }}</span>
          </a>
          <RouterLink
            v-else
            class="nav-button focus-ring"
            :class="{ active: route.path === item.to }"
            :to="item.to"
            :aria-current="route.path === item.to ? 'page' : undefined"
          >
            <AppIcon :name="item.icon" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </template>
      </nav>

      <div ref="menu" class="mobile-nav">
        <RouterLink class="button button-small focus-ring" to="/conferences">Browse</RouterLink>
        <button
          class="icon-button focus-ring"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="site-mobile-menu"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click.stop="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
        <nav
          v-if="menuOpen"
          id="site-mobile-menu"
          class="mobile-menu"
          aria-label="Mobile navigation"
        >
          <template v-for="item in items" :key="item.label">
            <a
              v-if="item.external"
              :href="item.to"
              target="_blank"
              rel="noopener noreferrer"
              class="mobile-menu-link focus-ring"
            >
              <AppIcon :name="item.icon" />{{ item.label }}
            </a>
            <RouterLink v-else :to="item.to" class="mobile-menu-link focus-ring">
              <AppIcon :name="item.icon" />{{ item.label }}
            </RouterLink>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>
