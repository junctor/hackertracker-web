<script setup lang="ts">
import { computed } from "vue";

import type { Conference, Content, Location, TagGroup } from "../types/hackertracker";

import { formatSessionTime } from "../lib/dates";
import { contentPath } from "../lib/routes";
import { getDisplayTags, sortedSessions } from "../lib/schedule";

const props = defineProps<{
  conference: Conference;
  content: Content;
  locations: Location[];
  tags: TagGroup[];
}>();
const session = computed(() => sortedSessions(props.content)[0]);
const location = computed(() =>
  props.locations.find((item) => item.id === session.value?.location_id),
);
const displayTags = computed(() => getDisplayTags(props.content, props.tags).slice(0, 3));
</script>

<template>
  <RouterLink class="content-card focus-ring" :to="contentPath(conference.code, content.id)">
    <article>
      <div v-if="session" class="session-meta">
        <time :datetime="new Date(session.begin_tsz).toISOString()">
          {{
            formatSessionTime(
              new Date(session.begin_tsz),
              new Date(session.end_tsz),
              session.timezone_name || conference.timezone,
            )
          }}
        </time>
        <span v-if="location">{{ location.name }}</span>
      </div>
      <h2>{{ content.title }}</h2>
      <p v-if="content.description">{{ content.description }}</p>
      <ul v-if="displayTags.length" class="card-tags">
        <li v-for="tag in displayTags" :key="tag.id">{{ tag.label }}</li>
      </ul>
    </article>
  </RouterLink>
</template>

<style scoped>
.content-card {
  display: block;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  background: var(--surface-muted);
  padding: var(--space-5);
  transition:
    border-color 0.18s,
    background-color 0.18s,
    transform 0.18s;
}
.content-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in oklab, var(--accent), transparent 48%);
  background: var(--surface-interactive);
}
.session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  color: var(--accent-success);
  font-size: 0.8rem;
  font-weight: 700;
}
h2 {
  margin-top: var(--space-3);
  font-size: 1.05rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
  text-wrap: balance;
}
p {
  display: -webkit-box;
  overflow: hidden;
  margin-top: var(--space-2);
  color: var(--text-muted);
  font-size: 0.9rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
.card-tags li {
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0.15rem 0.5rem;
  color: var(--text-subtle);
  font-size: 0.72rem;
}
</style>
