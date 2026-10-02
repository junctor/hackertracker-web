<script setup lang="ts">
import { computed, ref, shallowRef, watch, watchEffect } from "vue";

import type { Content, Organization, Person } from "../types/hackertracker";

import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import SearchField from "../components/SearchField.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { useRouteTextQuery } from "../composables/useRouteTextQuery";
import { getAllContent, getOrganizations, getSpeakers } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { conferenceSectionPath, contentPath, personPath } from "../lib/routes";
import { compareBySortOrder } from "../lib/sort";

const { conference } = useConferenceContext();
const query = useRouteTextQuery();
const contentItems = shallowRef<Content[]>([]);
const people = shallowRef<Person[]>([]);
const organizations = shallowRef<Organization[]>([]);
const loading = ref(true);
const error = ref("");
let request = 0;
const needle = computed(() => query.value.trim().toLowerCase());
const canSearch = computed(() => needle.value.length >= 2);
const contentIndex = computed(() =>
  contentItems.value.map((item) => ({
    item,
    text: `${item.title} ${item.description}`.toLocaleLowerCase(),
  })),
);
const peopleIndex = computed(() =>
  people.value.map((item) => ({
    item,
    text: `${item.name} ${item.title} ${item.description}`.toLocaleLowerCase(),
  })),
);
const organizationIndex = computed(() =>
  organizations.value.map((item) => ({
    item,
    text: `${item.name} ${item.description}`.toLocaleLowerCase(),
  })),
);
const contentResults = computed(() =>
  !canSearch.value
    ? []
    : contentIndex.value
        .filter(({ text }) => text.includes(needle.value))
        .map(({ item }) => item)
        .sort(
          (a, b) =>
            compareBySortOrder(a, b) ||
            a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
        )
        .slice(0, 30),
);
const peopleResults = computed(() =>
  !canSearch.value
    ? []
    : peopleIndex.value
        .filter(({ text }) => text.includes(needle.value))
        .map(({ item }) => item)
        .sort(
          (a, b) =>
            compareBySortOrder(a, b) ||
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        )
        .slice(0, 20),
);
const organizationResults = computed(() =>
  !canSearch.value
    ? []
    : organizationIndex.value
        .filter(({ text }) => text.includes(needle.value))
        .map(({ item }) => item)
        .sort(
          (a, b) =>
            compareBySortOrder(a, b) ||
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        )
        .slice(0, 20),
);
const total = computed(
  () => contentResults.value.length + peopleResults.value.length + organizationResults.value.length,
);
watch(
  [conference, canSearch],
  async ([current, shouldLoad]) => {
    const currentRequest = ++request;
    if (!current) {
      contentItems.value = [];
      people.value = [];
      organizations.value = [];
      loading.value = false;
      return;
    }
    if (!shouldLoad) {
      loading.value = false;
      error.value = "";
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      const [content, loadedPeople, loadedOrganizations] = await Promise.all([
        getAllContent(current.code),
        getSpeakers(current.code),
        getOrganizations(current.code),
      ]);
      if (currentRequest !== request) return;
      contentItems.value = content;
      people.value = loadedPeople;
      organizations.value = loadedOrganizations;
    } catch (reason) {
      if (currentRequest === request) error.value = friendlyLoadError(reason, "conference search");
    } finally {
      if (currentRequest === request) loading.value = false;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (conference.value) document.title = `Search · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content search-page">
    <PageHeading
      :title="`Search ${conference.name}`"
      intro="Find content, people, and organizations."
    />
    <SearchField
      v-model="query"
      class="page-search"
      label="Search conference"
      placeholder="Search the conference…"
      large
    />
    <PageState v-if="loading" kind="loading" message="Indexing conference content…" />
    <PageState v-else-if="error" kind="error" title="Search unavailable" :message="error" retry />
    <PageState
      v-else-if="!canSearch"
      kind="empty"
      message="Enter at least two characters to search titles, people, groups, and keywords."
    />
    <PageState
      v-else-if="!total"
      kind="empty"
      title="No results"
      :message="`Nothing matched “${query.trim()}”.`"
    />
    <div v-else class="result-groups" aria-live="polite">
      <section v-if="contentResults.length">
        <h2>
          Content <span>{{ contentResults.length }}</span>
        </h2>
        <ul>
          <li v-for="item in contentResults" :key="item.id">
            <RouterLink class="result-link focus-ring" :to="contentPath(conference.code, item.id)"
              ><strong>{{ item.title }}</strong
              ><small v-if="item.description">{{ item.description }}</small></RouterLink
            >
          </li>
        </ul>
      </section>
      <section v-if="peopleResults.length">
        <h2>
          People <span>{{ peopleResults.length }}</span>
        </h2>
        <ul>
          <li v-for="person in peopleResults" :key="person.id">
            <RouterLink class="result-link focus-ring" :to="personPath(conference.code, person.id)"
              ><strong>{{ person.name }}</strong
              ><small v-if="person.title">{{ person.title }}</small></RouterLink
            >
          </li>
        </ul>
      </section>
      <section v-if="organizationResults.length">
        <h2>
          Organizations <span>{{ organizationResults.length }}</span>
        </h2>
        <ul>
          <li v-for="organization in organizationResults" :key="organization.id">
            <RouterLink
              class="result-link focus-ring"
              :to="`${conferenceSectionPath(conference.code, 'organizations')}/${organization.id}`"
              ><strong>{{ organization.name }}</strong
              ><small v-if="organization.description">{{
                organization.description
              }}</small></RouterLink
            >
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.search-page {
  max-width: 60rem;
}
.result-groups {
  display: grid;
  gap: var(--space-8);
  margin-top: var(--space-8);
}
.result-groups h2 {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  font-size: 1.25rem;
}
.result-groups h2 span {
  padding-left: var(--space-1);
  color: var(--accent-success);
  font-size: 0.7rem;
}
.result-groups ul {
  display: grid;
  list-style: none;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.result-link {
  display: block;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  background: var(--surface-muted);
  padding: var(--space-4);
}
.result-link strong {
  overflow-wrap: anywhere;
}
.result-link:hover {
  border-color: color-mix(in oklab, var(--accent), transparent 50%);
  background: var(--surface-interactive);
}
.result-link small {
  display: -webkit-box;
  overflow: hidden;
  margin-top: var(--space-1);
  color: var(--text-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
