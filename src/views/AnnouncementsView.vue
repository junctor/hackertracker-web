<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";

import type { ConferenceArticle } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getArticles } from "../firebase/data";
import { toDate } from "../lib/dates";

const { conference } = useConferenceContext();
const articles = ref<ConferenceArticle[]>([]);
const loading = ref(true);
const error = ref("");
watch(
  conference,
  async (current) => {
    if (!current) return;
    loading.value = true;
    try {
      articles.value = (await getArticles(current.code)).sort(
        (a, b) => (toDate(b.updatedAt)?.getTime() ?? 0) - (toDate(a.updatedAt)?.getTime() ?? 0),
      );
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : "Failed to load announcements";
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (conference.value)
    document.title = `Announcements · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content announcements-page">
    <header>
      <p class="kicker">Latest updates</p>
      <h1 tabindex="-1">Announcements</h1>
      <p>Conference announcements and updates.</p>
    </header>
    <PageState v-if="loading" kind="loading" message="Loading announcements..." />
    <PageState
      v-else-if="error"
      kind="error"
      title="Couldn't load announcements"
      :message="error"
    />
    <PageState v-else-if="!articles.length" kind="empty" message="No announcements at this time." />
    <ul v-else class="announcement-list">
      <li v-for="(article, index) in articles" :key="article.id">
        <details class="announcement-card" :open="index === 0">
          <summary class="focus-ring">
            <span
              ><strong>{{ article.name }}</strong
              ><time
                v-if="toDate(article.updatedAt)"
                :datetime="toDate(article.updatedAt)!.toISOString()"
                >{{
                  toDate(article.updatedAt)!.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: conference.timezone,
                  })
                }}</time
              ></span
            >
          </summary>
          <div v-if="article.text" class="announcement-body">
            <MarkdownContent :content="article.text" />
          </div>
        </details>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.announcements-page {
  padding-block: var(--section-space);
}
.kicker {
  color: var(--accent-success);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
h1 {
  margin-top: 0.2rem;
  font-size: clamp(2rem, 5vw, 3.25rem);
}
header > p:last-child {
  margin-top: var(--space-2);
  color: var(--text-muted);
}
.announcement-list {
  display: grid;
  list-style: none;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
.announcement-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  background: var(--surface-muted);
}
summary {
  cursor: pointer;
  padding: var(--space-5);
}
summary > span {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
}
time {
  color: var(--text-subtle);
  font-size: 0.8rem;
  white-space: nowrap;
}
.announcement-body {
  border-top: 1px solid var(--border);
  padding: var(--space-5);
}
@media (width < 40rem) {
  summary > span {
    flex-direction: column;
  }
}
</style>
