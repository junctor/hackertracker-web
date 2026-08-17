<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import { RouterLink } from "vue-router";

import type { ProcessedTag } from "../types/hackertracker";

withDefaults(
  defineProps<{
    title: string;
    to?: RouteLocationRaw;
    begin?: string;
    end?: string;
    duration?: string;
    beginDateTime?: string;
    endDateTime?: string;
    people?: string | null;
    location?: string | null;
    tags?: ProcessedTag[];
    status?: "Live" | "Next" | null;
    accent?: "content" | "schedule";
    accentColor?: string | null;
  }>(),
  {
    to: undefined,
    begin: undefined,
    end: undefined,
    duration: undefined,
    beginDateTime: undefined,
    endDateTime: undefined,
    people: null,
    location: null,
    tags: () => [],
    status: null,
    accent: "content",
    accentColor: null,
  },
);
</script>

<template>
  <article
    class="session-card"
    :class="`session-card--${accent}`"
    :style="{ '--session-accent': accentColor || 'var(--brand-cyan)' }"
  >
    <span class="session-accent" aria-hidden="true" />
    <div class="session-row">
      <component
        :is="to ? RouterLink : 'div'"
        v-bind="to ? { to } : {}"
        class="session-link focus-ring"
        :class="{ 'session-link--timed': begin }"
      >
        <div v-if="begin" class="session-time">
          <span
            v-if="status"
            class="session-status"
            :class="`session-status--${status.toLowerCase()}`"
            >{{ status }}</span
          >
          <time :datetime="beginDateTime">{{ begin }}</time>
          <time v-if="end" :datetime="endDateTime">{{ end }}</time>
          <span v-if="duration" class="session-duration">{{ duration }}</span>
        </div>
        <div class="session-summary">
          <h3>{{ title }}</h3>
          <p v-if="people" class="session-people">{{ people }}</p>
          <p v-if="location">{{ location }}</p>
          <ul v-if="tags.length" class="session-tags">
            <li
              v-for="tag in tags.slice(0, 3)"
              :key="tag.id"
              :style="{
                backgroundColor: tag.color_background ?? undefined,
                color: tag.color_foreground ?? undefined,
              }"
            >
              {{ tag.label }}
            </li>
            <li v-if="tags.length > 3" class="session-tag-more">+{{ tags.length - 3 }} more</li>
          </ul>
        </div>
      </component>
      <div v-if="$slots.actions" class="session-actions"><slot name="actions" /></div>
    </div>
  </article>
</template>

<style scoped>
.session-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  background: color-mix(in oklab, var(--surface), transparent 35%);
  transition:
    border-color 180ms ease,
    background-color 180ms ease;
}

.session-card:hover,
.session-card:focus-within {
  border-color: color-mix(in oklab, var(--accent), transparent 48%);
  background: var(--surface-elevated);
}

.session-accent {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0.28rem;
  background: color-mix(in srgb, var(--session-accent) 72%, black);
  transition: width 180ms ease;
}

.session-card--content:hover .session-accent,
.session-card--content:focus-within .session-accent {
  width: 0.44rem;
}

.session-card--schedule .session-accent {
  width: 0.22rem;
}

.session-card--schedule:hover .session-accent,
.session-card--schedule:focus-within .session-accent {
  width: 0.34rem;
}

.session-row {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: var(--space-3);
  padding: 0.9rem 1rem 0.9rem 1.2rem;
}

.session-link {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  border-radius: var(--radius-1);
}

.session-link--timed {
  grid-template-columns: 10rem minmax(0, 1fr);
}

.session-time {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.session-time time:first-of-type {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 650;
}

.session-duration {
  color: var(--text-subtle);
  font-size: 0.75rem;
  font-weight: 650;
}

.session-status {
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.session-status--live {
  color: #ffb4c9;
}

.session-status--next {
  color: var(--warning);
}

.session-summary {
  min-width: 0;
}

.session-summary h3 {
  color: var(--text-primary);
  font-size: clamp(1.02rem, 3vw, 1.16rem);
  line-height: 1.35;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.session-summary > p {
  overflow: hidden;
  margin-top: var(--space-1);
  color: var(--text-muted);
  font-size: 0.875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-summary .session-people {
  font-style: italic;
  white-space: normal;
}

.session-tags {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.session-tags li {
  overflow: hidden;
  max-width: 14rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: var(--radius-pill);
  padding: 0.15rem 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-tags .session-tag-more {
  border-color: var(--border);
  background: transparent;
  color: var(--text-muted);
}

.session-actions {
  display: flex;
  flex: 0 0 auto;
  gap: var(--space-2);
}

@media (width < 30rem) {
  .session-row {
    flex-direction: column;
  }

  .session-actions {
    align-self: flex-end;
  }
}

@media (width < 40rem) {
  .session-link--timed {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .session-time {
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    column-gap: var(--space-3);
  }

  .session-time .session-status {
    grid-column: 1 / -1;
  }

  .session-duration {
    grid-column: 1 / -1;
  }
}
</style>
