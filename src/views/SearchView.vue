<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch, watchEffect } from "vue";

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
const pendingSections = ref(0);
const debouncedNeedle = ref("");
const visibleContentCount = ref(10);
const visiblePeopleCount = ref(10);
const visibleOrganizationCount = ref(10);
let request = 0;
let filterTimer: number | undefined;
let activeConferenceCode = "";
const needle = computed(() => query.value.trim().toLowerCase());
const canSearch = computed(() => needle.value.length >= 2);
const activeNeedle = computed(() => debouncedNeedle.value.trim().toLocaleLowerCase());
const canFilter = computed(() => activeNeedle.value.length >= 2);

interface MatchSnippet {
  before: string;
  match: string;
  after: string;
}

function snippet(values: Array<string | null | undefined>): MatchSnippet | null {
  const candidates = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!candidates.length) return null;
  const matched = candidates.find((value) =>
    value.toLocaleLowerCase().includes(activeNeedle.value),
  );
  const source = matched ?? candidates[0] ?? "";
  const matchIndex = matched?.toLocaleLowerCase().indexOf(activeNeedle.value) ?? -1;
  const start = Math.max(0, matchIndex >= 0 ? matchIndex - 64 : 0);
  const end = Math.min(
    source.length,
    matchIndex >= 0 ? matchIndex + activeNeedle.value.length + 96 : 160,
  );
  return {
    before: `${start > 0 ? "…" : ""}${source.slice(start, matchIndex >= 0 ? matchIndex : end)}`,
    match: matchIndex >= 0 ? source.slice(matchIndex, matchIndex + activeNeedle.value.length) : "",
    after:
      matchIndex >= 0
        ? `${source.slice(matchIndex + activeNeedle.value.length, end)}${end < source.length ? "…" : ""}`
        : end < source.length
          ? "…"
          : "",
  };
}

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
const allContentResults = computed(() =>
  !canFilter.value
    ? []
    : contentIndex.value
        .filter(({ text }) => text.includes(activeNeedle.value))
        .map(({ item }) => ({ item, snippet: snippet([item.description, item.title]) }))
        .sort(
          (a, b) =>
            compareBySortOrder(a.item, b.item) ||
            a.item.title.localeCompare(b.item.title, undefined, { sensitivity: "base" }),
        ),
);
const allPeopleResults = computed(() =>
  !canFilter.value
    ? []
    : peopleIndex.value
        .filter(({ text }) => text.includes(activeNeedle.value))
        .map(({ item }) => ({ item, snippet: snippet([item.title, item.description, item.name]) }))
        .sort(
          (a, b) =>
            compareBySortOrder(a.item, b.item) ||
            a.item.name.localeCompare(b.item.name, undefined, { sensitivity: "base" }),
        ),
);
const allOrganizationResults = computed(() =>
  !canFilter.value
    ? []
    : organizationIndex.value
        .filter(({ text }) => text.includes(activeNeedle.value))
        .map(({ item }) => ({ item, snippet: snippet([item.description, item.name]) }))
        .sort(
          (a, b) =>
            compareBySortOrder(a.item, b.item) ||
            a.item.name.localeCompare(b.item.name, undefined, { sensitivity: "base" }),
        ),
);
const contentResults = computed(() => allContentResults.value.slice(0, visibleContentCount.value));
const peopleResults = computed(() => allPeopleResults.value.slice(0, visiblePeopleCount.value));
const organizationResults = computed(() =>
  allOrganizationResults.value.slice(0, visibleOrganizationCount.value),
);
const total = computed(
  () =>
    allContentResults.value.length +
    allPeopleResults.value.length +
    allOrganizationResults.value.length,
);

watch(
  needle,
  (value) => {
    if (filterTimer !== undefined) window.clearTimeout(filterTimer);
    if (value.length < 2) {
      debouncedNeedle.value = value;
      filterTimer = undefined;
      return;
    }
    filterTimer = window.setTimeout(() => {
      debouncedNeedle.value = value;
      filterTimer = undefined;
    }, 200);
  },
  { immediate: true },
);
watch(activeNeedle, () => {
  visibleContentCount.value = 10;
  visiblePeopleCount.value = 10;
  visibleOrganizationCount.value = 10;
});

watch(
  [conference, canSearch],
  ([current, shouldLoad]) => {
    const currentRequest = ++request;
    if (!current) {
      activeConferenceCode = "";
      contentItems.value = [];
      people.value = [];
      organizations.value = [];
      loading.value = false;
      pendingSections.value = 0;
      return;
    }
    if (current.code !== activeConferenceCode) {
      activeConferenceCode = current.code;
      contentItems.value = [];
      people.value = [];
      organizations.value = [];
    }
    if (!shouldLoad) {
      loading.value = false;
      pendingSections.value = 0;
      error.value = "";
      return;
    }
    loading.value = true;
    error.value = "";
    pendingSections.value = 3;
    const failures: unknown[] = [];
    const finish = () => {
      if (currentRequest !== request) return;
      pendingSections.value -= 1;
      if (pendingSections.value) return;
      loading.value = false;
      if (failures.length === 3) error.value = friendlyLoadError(failures[0], "conference search");
      else if (failures.length)
        error.value = "Some conference results could not be loaded. Showing what is available.";
    };
    void getAllContent(current.code)
      .then((content) => {
        if (currentRequest === request) contentItems.value = content;
      })
      .catch((reason: unknown) => failures.push(reason))
      .finally(finish);
    void getSpeakers(current.code)
      .then((loadedPeople) => {
        if (currentRequest === request) people.value = loadedPeople;
      })
      .catch((reason: unknown) => failures.push(reason))
      .finally(finish);
    void getOrganizations(current.code)
      .then((loadedOrganizations) => {
        if (currentRequest === request) organizations.value = loadedOrganizations;
      })
      .catch((reason: unknown) => failures.push(reason))
      .finally(finish);
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  if (filterTimer !== undefined) window.clearTimeout(filterTimer);
});
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
    <PageState
      v-if="!canSearch"
      kind="empty"
      heading-level="h2"
      message="Enter at least two characters to search titles, people, groups, and keywords."
    />
    <PageState
      v-else-if="loading && !total"
      kind="loading"
      heading-level="h2"
      :message="`Indexing conference content… ${3 - pendingSections} of 3 sources ready.`"
    />
    <PageState
      v-else-if="error && !total"
      kind="error"
      heading-level="h2"
      :title="error.startsWith('Some') ? 'Search incomplete' : 'Search unavailable'"
      :message="error"
      retry
    />
    <PageState
      v-else-if="!loading && !total"
      kind="empty"
      heading-level="h2"
      title="No results"
      :message="`Nothing matched “${query.trim()}”.`"
    />
    <div v-else class="result-groups" aria-live="polite">
      <p v-if="loading" class="search-notice" role="status">
        Searching remaining conference sources…
      </p>
      <p v-if="error" class="search-notice search-notice--error" role="alert">{{ error }}</p>
      <section v-if="allContentResults.length">
        <h2>
          Content <span>{{ allContentResults.length }}</span>
        </h2>
        <ul>
          <li v-for="result in contentResults" :key="result.item.id">
            <RouterLink
              class="result-link focus-ring"
              :to="contentPath(conference.code, result.item.id)"
              ><strong>{{ result.item.title }}</strong
              ><small v-if="result.snippet"
                >{{ result.snippet.before
                }}<mark v-if="result.snippet.match">{{ result.snippet.match }}</mark
                >{{ result.snippet.after }}</small
              ></RouterLink
            >
          </li>
        </ul>
        <button
          v-if="contentResults.length < allContentResults.length"
          type="button"
          class="button show-more focus-ring"
          @click="visibleContentCount += 10"
        >
          Show {{ Math.min(10, allContentResults.length - contentResults.length) }} more content
        </button>
      </section>
      <section v-if="allPeopleResults.length">
        <h2>
          People <span>{{ allPeopleResults.length }}</span>
        </h2>
        <ul>
          <li v-for="result in peopleResults" :key="result.item.id">
            <RouterLink
              class="result-link focus-ring"
              :to="personPath(conference.code, result.item.id)"
              ><strong>{{ result.item.name }}</strong
              ><small v-if="result.snippet"
                >{{ result.snippet.before
                }}<mark v-if="result.snippet.match">{{ result.snippet.match }}</mark
                >{{ result.snippet.after }}</small
              ></RouterLink
            >
          </li>
        </ul>
        <button
          v-if="peopleResults.length < allPeopleResults.length"
          type="button"
          class="button show-more focus-ring"
          @click="visiblePeopleCount += 10"
        >
          Show {{ Math.min(10, allPeopleResults.length - peopleResults.length) }} more people
        </button>
      </section>
      <section v-if="allOrganizationResults.length">
        <h2>
          Organizations <span>{{ allOrganizationResults.length }}</span>
        </h2>
        <ul>
          <li v-for="result in organizationResults" :key="result.item.id">
            <RouterLink
              class="result-link focus-ring"
              :to="`${conferenceSectionPath(conference.code, 'organizations')}/${result.item.id}`"
              ><strong>{{ result.item.name }}</strong
              ><small v-if="result.snippet"
                >{{ result.snippet.before
                }}<mark v-if="result.snippet.match">{{ result.snippet.match }}</mark
                >{{ result.snippet.after }}</small
              ></RouterLink
            >
          </li>
        </ul>
        <button
          v-if="organizationResults.length < allOrganizationResults.length"
          type="button"
          class="button show-more focus-ring"
          @click="visibleOrganizationCount += 10"
        >
          Show
          {{ Math.min(10, allOrganizationResults.length - organizationResults.length) }} more
          organizations
        </button>
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
.search-notice {
  border-left: 2px solid var(--accent-success);
  padding-left: var(--space-3);
  color: var(--text-muted);
  font-size: 0.875rem;
}
.search-notice--error {
  border-left-color: var(--critical);
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
.result-link mark {
  border-radius: 0.15rem;
  background: color-mix(in oklab, var(--warning), transparent 78%);
  color: var(--text-primary);
}
.show-more {
  margin-top: var(--space-3);
}
</style>
