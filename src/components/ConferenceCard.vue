<script setup lang="ts">
import { computed } from "vue";

import type { Conference } from "../types/hackertracker";

import { formatDateRange, timeZoneAbbreviation, toDate } from "../lib/dates";
import { conferencePath } from "../lib/routes";

const props = defineProps<{ conference: Conference; updatedAt?: Date }>();
const range = computed(() =>
  formatDateRange(
    toDate(props.conference.start_timestamp) ?? toDate(props.conference.start_date),
    toDate(props.conference.end_timestamp) ?? toDate(props.conference.end_date),
    props.conference.timezone,
  ),
);
const zone = computed(() => timeZoneAbbreviation(props.conference.timezone));
const updatedLabel = computed(() =>
  props.updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(props.updatedAt)
    : undefined,
);
</script>

<template>
  <RouterLink :to="conferencePath(conference.code)" class="conference-card-link focus-ring">
    <article class="card interactive conference-card">
      <h3 :title="conference.name">{{ conference.name }}</h3>
      <p v-if="range || zone" class="conference-meta">
        <time v-if="range">{{ range }}</time
        ><span v-if="range && zone" aria-hidden="true">•</span><span v-if="zone">{{ zone }}</span>
      </p>
      <p v-if="updatedAt && updatedLabel" class="updated-at">
        Updated <time :datetime="updatedAt.toISOString()">{{ updatedLabel }}</time>
      </p>
    </article>
  </RouterLink>
</template>

<style scoped>
.conference-card-link {
  display: block;
  height: 100%;
  border-radius: var(--radius-2);
  text-align: left;
}

.conference-card {
  display: flex;
  min-height: 7.25rem;
  height: 100%;
  flex-direction: column;
  border-radius: var(--radius-2);
  padding: 1rem;
  box-shadow: none;
}

h3 {
  display: -webkit-box;
  overflow: hidden;
  min-height: 2.75rem;
  color: var(--text-primary);
  font-size: 1.05rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.conference-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
}

.updated-at {
  margin-top: 0.4rem;
  color: var(--text-subtle);
  font-size: 0.72rem;
}
</style>
