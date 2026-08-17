<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { Content, TagGroup } from "../types/hackertracker";

import ContentCard from "../components/ContentCard.vue";
import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import SearchField from "../components/SearchField.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getAllContent, getTags } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { compareBySortOrder } from "../lib/sort";

const route = useRoute();
const router = useRouter();
const { conference, menuItems } = useConferenceContext();
const contentItems = ref<Content[]>([]);
const tags = ref<TagGroup[]>([]);
const loading = ref(true);
const error = ref("");
const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const selectedTag = ref<number | "">(
  typeof route.query.tag === "string" && /^\d+$/.test(route.query.tag)
    ? Number(route.query.tag)
    : "",
);
const contentMenuItem = computed(() => menuItems.value.find((item) => item.routeKey === "content"));
const fixedTags = computed(() => contentMenuItem.value?.appliedTagIds ?? []);
const availableTags = computed(() =>
  tags.value
    .filter((group) => group.is_browsable)
    .flatMap((group) => group.tags)
    .filter((tag) => contentItems.value.some((item) => item.tag_ids?.includes(tag.id)))
    .sort((a, b) => compareBySortOrder(a, b) || a.label.localeCompare(b.label)),
);
const allowTagFilter = computed(() => !contentMenuItem.value?.prohibitTagFilter);

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return contentItems.value
    .filter(
      (item) =>
        !fixedTags.value.length || fixedTags.value.every((tagId) => item.tag_ids?.includes(tagId)),
    )
    .filter(
      (item) => typeof selectedTag.value !== "number" || item.tag_ids?.includes(selectedTag.value),
    )
    .filter((item) => !needle || `${item.title} ${item.description}`.toLowerCase().includes(needle))
    .sort(
      (a, b) =>
        compareBySortOrder(a, b) ||
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
    );
});

watch(
  conference,
  async (current) => {
    if (!current) return;
    loading.value = true;
    error.value = "";
    try {
      [contentItems.value, tags.value] = await Promise.all([
        getAllContent(current.code),
        getTags(current.code),
      ]);
    } catch (reason) {
      error.value = friendlyLoadError(reason, "conference content");
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
watch([query, selectedTag], ([value, tag]) => {
  const next = { ...route.query };
  if (value.trim()) next.q = value;
  else delete next.q;
  if (typeof tag === "number") next.tag = String(tag);
  else delete next.tag;
  void router.replace({ query: next });
});
watch(
  () => [route.query.q, route.query.tag] as const,
  ([nextQuery, nextTag]) => {
    const queryValue = typeof nextQuery === "string" ? nextQuery : "";
    const tagValue = typeof nextTag === "string" && /^\d+$/.test(nextTag) ? Number(nextTag) : "";
    if (query.value !== queryValue) query.value = queryValue;
    if (selectedTag.value !== tagValue) selectedTag.value = tagValue;
  },
);
watchEffect(() => {
  if (conference.value) document.title = `Content · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content">
    <PageHeading
      title="Content"
      intro="Talks, workshops, and activities."
      :count="loading ? undefined : `${filtered.length.toLocaleString()} results`"
    />
    <div class="content-controls">
      <SearchField
        v-model="query"
        class="content-search"
        label="Search content"
        placeholder="Search content…"
      />
      <label v-if="allowTagFilter && availableTags.length" class="tag-control">
        <span class="visually-hidden">Filter content by tag</span>
        <select v-model="selectedTag" class="input focus-ring">
          <option value="">All tags</option>
          <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
            {{ tag.label }}
          </option>
        </select>
      </label>
    </div>
    <PageState v-if="loading" kind="loading" message="Getting conference content…" />
    <PageState v-else-if="error" kind="error" title="Content unavailable" :message="error" />
    <PageState
      v-else-if="!filtered.length"
      kind="empty"
      title="No content found"
      :message="query ? `No content matches “${query}”.` : 'No content is listed yet.'"
    />
    <ul v-else class="content-grid">
      <li v-for="item in filtered" :key="item.id">
        <ContentCard :conference="conference" :content="item" :tags="tags" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.content-search {
  flex: 1 1 22rem;
}
.content-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
.tag-control {
  flex: 0 1 18rem;
}
.tag-control select {
  width: 100%;
}
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
</style>
