<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import type { Conference, TimestampParts } from "../types/hackertracker";

import ConferenceCard from "../components/ConferenceCard.vue";
import PageState from "../components/PageState.vue";
import SiteFooter from "../components/SiteFooter.vue";
import SiteHeader from "../components/SiteHeader.vue";
import { getConferences } from "../firebase/data";
import { toDate, type DateLike } from "../lib/dates";
import { friendlyLoadError } from "../lib/errors";

const conferences = ref<Conference[]>([]);
const loading = ref(true);
const error = ref("");

type FlexibleConference = Conference & {
  updated_timestamp?: TimestampParts;
  updated_tsz?: string;
  updated?: DateLike;
  modified?: DateLike;
};

const millis = (value?: DateLike) => toDate(value)?.getTime() ?? 0;
const start = (conference: Conference) =>
  millis(
    conference.start_timestamp ??
      conference.start_timestamp_str ??
      conference.start_date ??
      conference.begin_tsz,
  );
const end = (conference: Conference) =>
  millis(
    conference.end_timestamp ??
      conference.end_timestamp_str ??
      conference.end_date ??
      conference.end_tsz,
  );
const updatedDate = (conference: Conference) => {
  const value = conference as FlexibleConference;
  return toDate(
    value.updated_at ??
      value.updated_timestamp ??
      value.updated_tsz ??
      value.updated ??
      value.modified,
  );
};

const groups = computed(() => {
  const now = Date.now();
  const upcoming = conferences.value
    .filter((conference) => (end(conference) || start(conference)) >= now)
    .sort((a, b) => start(a) - start(b));
  const past = conferences.value
    .filter((conference) => (end(conference) || start(conference)) < now)
    .sort((a, b) => start(b) - start(a));
  const updated = conferences.value
    .filter((conference) => {
      const timestamp = updatedDate(conference)?.getTime() ?? start(conference);
      return timestamp > 0 && now - timestamp <= 30 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => (updatedDate(b)?.getTime() ?? 0) - (updatedDate(a)?.getTime() ?? 0));
  return [
    { id: "upcoming", title: "Upcoming Conferences", items: upcoming },
    { id: "updated", title: "Recently Updated", items: updated },
    { id: "past", title: "Past Conferences", items: past },
  ];
});

onMounted(async () => {
  document.title = "Conferences · Hacker Tracker";
  try {
    conferences.value = await getConferences(500);
  } catch (reason) {
    error.value = friendlyLoadError(reason, "conferences");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main id="main" class="container wide page-content">
      <header class="page-heading">
        <h1 tabindex="-1">Conferences</h1>
        <div class="divider" />
      </header>
      <div v-if="loading" class="conference-grid" aria-label="Loading conferences" aria-busy="true">
        <div v-for="index in 8" :key="index" class="card skeleton" />
      </div>
      <PageState
        v-else-if="error"
        kind="error"
        title="Conferences are unavailable"
        :message="error"
      />
      <div v-else class="conference-sections">
        <section
          v-for="group in groups"
          :id="group.id"
          :key="group.id"
          :aria-labelledby="`${group.id}-title`"
        >
          <div class="section-title-row">
            <h2 :id="`${group.id}-title`">
              {{ group.title }} <span class="count">{{ group.items.length }}</span>
            </h2>
            <a
              class="anchor-link focus-ring"
              :href="`#${group.id}`"
              :aria-label="`Link to section ${group.title}`"
              >#</a
            >
          </div>
          <div class="divider" />
          <div v-if="group.items.length" class="conference-grid">
            <ConferenceCard
              v-for="conference in group.items"
              :key="conference.id"
              :conference="conference"
              :updated-at="group.id === 'updated' ? updatedDate(conference) : undefined"
            />
          </div>
          <div v-else class="empty-state">
            {{
              group.id === "updated" ? "No recent updates." : `No ${group.id} conferences found.`
            }}
          </div>
        </section>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.page-heading {
  margin-bottom: 1.75rem;
}

.page-heading h1 {
  font-size: clamp(2rem, 5vw, 2.5rem);
  line-height: 1.15;
}

.conference-sections {
  display: grid;
  gap: 2.5rem;
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

.count {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 650;
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

.anchor-link {
  color: var(--text-subtle);
}

.skeleton {
  min-height: 7.25rem;
  animation: pulse 1.2s ease-in-out infinite alternate;
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

@media (width < 40rem) {
  .conference-grid {
    grid-template-columns: 1fr;
  }
}
</style>
