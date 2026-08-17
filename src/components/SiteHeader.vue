<script setup lang="ts">
import { AppWindow, Calendar, CircleHelp, GitFork, Info, Menu, X } from "@lucide/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
const menuOpen = ref(false);
const scrolled = ref(false);
const menu = ref<HTMLElement | null>(null);

const items = [
  { label: "Conferences", to: "/conferences", icon: Calendar },
  {
    label: "Apps",
    to: `${import.meta.env.BASE_URL}apps/index.html`,
    icon: AppWindow,
    static: true,
  },
  { label: "About", to: "/about", icon: Info },
  { label: "Support", to: "/support", icon: CircleHelp },
  {
    label: "GitHub",
    to: "https://github.com/junctor/hackertracker-web",
    icon: GitFork,
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
        <img src="/images/logos/ht-logo.png" alt="" />
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
            <component :is="item.icon" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </a>
          <a v-else-if="item.static" class="nav-button focus-ring" :href="item.to">
            <component :is="item.icon" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </a>
          <RouterLink
            v-else
            class="nav-button focus-ring"
            :class="{ active: route.path === item.to }"
            :to="item.to"
            :aria-current="route.path === item.to ? 'page' : undefined"
          >
            <component :is="item.icon" aria-hidden="true" />
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
          <X v-if="menuOpen" aria-hidden="true" />
          <Menu v-else aria-hidden="true" />
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
              <component :is="item.icon" aria-hidden="true" />{{ item.label }}
            </a>
            <a v-else-if="item.static" :href="item.to" class="mobile-menu-link focus-ring">
              <component :is="item.icon" aria-hidden="true" />{{ item.label }}
            </a>
            <RouterLink v-else :to="item.to" class="mobile-menu-link focus-ring">
              <component :is="item.icon" aria-hidden="true" />{{ item.label }}
            </RouterLink>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 50;
  top: 0;
  min-height: 4rem;
  border-bottom: 1px solid var(--border);
  background: var(--color-bg);
  transition: box-shadow 180ms ease;
}

.site-header--scrolled {
  box-shadow: var(--shadow-sm);
}

.header-inner,
.desktop-nav,
.mobile-nav,
.nav-button,
.mobile-menu-link {
  display: flex;
  align-items: center;
}

.header-inner {
  width: min(var(--layout-wide), calc(100% - var(--page-padding) * 2));
  min-height: 4rem;
  margin-inline: auto;
  justify-content: space-between;
  gap: var(--space-3);
  padding-block: 0.625rem;
}

.brand {
  display: flex;
  align-items: center;
  padding: 0.25rem;
}

.brand img {
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 2.35rem;
  image-rendering: pixelated;
}

.desktop-nav,
.mobile-nav {
  gap: var(--space-2);
}

.mobile-nav {
  position: relative;
  display: none;
}

.nav-button {
  min-height: 2.5rem;
  gap: var(--space-2);
  padding: 0.45rem 0.65rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 650;
}

.nav-button svg,
.mobile-menu-link svg {
  width: 1.15rem;
  height: 1.15rem;
  color: var(--accent-success);
}

.nav-button:hover,
.nav-button.active {
  color: white;
}

.mobile-menu {
  position: absolute;
  z-index: 60;
  top: calc(100% + 0.5rem);
  right: 0;
  display: grid;
  width: min(15rem, calc(100vw - 2rem));
  gap: var(--space-1);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-2);
  background: var(--color-bg);
  padding: var(--space-2);
  box-shadow: var(--shadow-lg);
}

.mobile-menu-link {
  gap: var(--space-3);
  padding: 0.65rem 0.75rem;
  color: var(--text-muted);
}

.mobile-menu-link:hover,
.mobile-menu-link.router-link-active {
  background: var(--surface-muted);
  color: white;
}

@media (width < 48rem) {
  .desktop-nav {
    display: none;
  }

  .mobile-nav {
    display: flex;
  }
}
</style>
