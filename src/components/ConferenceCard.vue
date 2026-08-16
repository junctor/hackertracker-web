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
