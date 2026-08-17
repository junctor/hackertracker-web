<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";

import type { ConferenceArticle } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getArticles } from "../firebase/data";
import { formatDateTime, toIsoDateTime } from "../lib/dates";
import { friendlyLoadError } from "../lib/errors";
import { compareBySortOrder } from "../lib/sort";

const { conference } = useConferenceContext();
const articles = ref<ConferenceArticle[]>([]);
const loading = ref(true);
const error = ref("");
const displayedArticles = computed(() =>
  articles.value.map((article) => {
    const dateTime = toIsoDateTime(article.updatedAt);
    const dateLabel = formatDateTime(article.updatedAt, conference.value?.timezone);
    return { ...article, updated: dateTime && dateLabel ? { dateTime, dateLabel } : null };
  }),
);
watch(
  conference,
  async (current) => {
    if (!current) return;
    loading.value = true;
    try {
      articles.value = (await getArticles(current.code)).sort(
        (a, b) =>
          compareBySortOrder(a, b) ||
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
    } catch (reason) {
      error.value = friendlyLoadError(reason, "announcements");
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
  <section v-if="conference" class="container page-content">
    <PageHeading title="Announcements" intro="Conference updates." />
    <PageState v-if="loading" kind="loading" message="Checking for announcements…" />
    <PageState v-else-if="error" kind="error" title="Announcements unavailable" :message="error" />
    <PageState v-else-if="!articles.length" kind="empty" message="No announcements yet." />
    <ul v-else class="announcement-list">
      <li v-for="(article, index) in displayedArticles" :key="article.id">
        <details class="announcement-card" :open="index === 0">
          <summary class="focus-ring">
            <span
              ><strong>{{ article.name }}</strong
              ><time v-if="article.updated" :datetime="article.updated.dateTime">{{
                article.updated.dateLabel
              }}</time></span
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
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  list-style: none;
  padding: var(--space-5);
}
summary::-webkit-details-marker {
  display: none;
}
summary::after {
  content: "›";
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--text-subtle);
  font-size: 1.35rem;
  line-height: 1;
  transform: rotate(90deg);
  transition: transform 0.18s ease;
}
details[open] summary::after {
  transform: rotate(-90deg);
}
summary > span {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
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
