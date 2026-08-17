<script setup lang="ts">
import { onMounted, ref } from "vue";

import type { Conference } from "../types/hackertracker";

import ConferenceCard from "../components/ConferenceCard.vue";
import PageState from "../components/PageState.vue";
import SitePageLayout from "../components/SitePageLayout.vue";
import { getUpcomingConferences } from "../firebase/data";
import { compareBySortOrder } from "../lib/sort";

const conferences = ref<Conference[]>([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  document.title = "Hacker Tracker — Schedules for hackers, by hackers";
  try {
    conferences.value = (await getUpcomingConferences()).sort(
      (a, b) =>
        compareBySortOrder(a, b) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  } catch {
    error.value = "We couldn’t load upcoming conferences. Check your connection and try again.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <SitePageLayout main-class="home-main">
    <header class="hero">
      <h1 tabindex="-1"><span>Hacker</span><span>Tracker</span></h1>
    </header>

    <section
      v-if="loading || error || conferences.length"
      id="upcoming-mini"
      class="container wide home-conferences"
      aria-labelledby="upcoming-title"
    >
      <div class="section-title-row">
        <h2 id="upcoming-title">
          Upcoming Conferences <span v-if="!loading" class="count">{{ conferences.length }}</span>
        </h2>
      </div>
      <div class="divider" />
      <div
        v-if="loading"
        class="conference-grid"
        aria-busy="true"
        aria-label="Loading upcoming conferences"
      >
        <div v-for="index in 4" :key="index" class="card skeleton" />
      </div>
      <PageState
        v-else-if="error"
        kind="error"
        title="Conferences are unavailable"
        :message="error"
      />
      <div v-else class="conference-grid">
        <ConferenceCard
          v-for="conference in conferences"
          :key="conference.id"
          :conference="conference"
        />
      </div>
      <RouterLink class="view-all focus-ring" to="/conferences">View all conferences</RouterLink>
    </section>
  </SitePageLayout>
</template>

<style scoped>
:deep(.home-main) {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: clamp(3.5rem, 10vw, 7rem) 0 3rem;
}

.hero {
  width: min(var(--layout-wide), calc(100% - (var(--page-padding) * 2)));
}

.hero h1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: clamp(3.5rem, 16vw, 7.75rem);
  font-weight: 850;
  letter-spacing: 0;
  line-height: 0.9;
  text-shadow:
    0.045em 0.045em 0 var(--brand-cyan),
    -0.045em -0.045em 0 var(--brand-red);
}

.hero h1 span {
  white-space: nowrap;
}

.home-conferences {
  margin-top: clamp(3.5rem, 9vw, 6rem);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.section-title-row h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.divider {
  height: 1px;
  margin-block: 0.75rem 1rem;
  background: var(--border);
}

.conference-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 1rem;
}

.skeleton {
  min-height: 7.25rem;
  animation: pulse 1.2s ease-in-out infinite alternate;
}

.view-all {
  display: table;
  margin-top: 1.5rem;
  margin-inline: auto;
  color: var(--accent-success);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, var(--accent-success), transparent 50%);
  text-underline-offset: 0.18em;
}

.view-all:hover {
  color: white;
}

.count {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 650;
}

@keyframes pulse {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 0.85;
  }
}

@media (width < 56rem) {
  .conference-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 56rem) {
  .hero h1 {
    flex-direction: row;
    justify-content: center;
    gap: 0.22em;
    font-size: clamp(5rem, 10.4vw, 9rem);
  }
}

@media (width < 40rem) {
  .conference-grid {
    grid-template-columns: 1fr;
  }
}
</style>
