<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { Content, Organization, Person } from "../types/hackertracker";

import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getAllContent, getOrganizations, getSpeakers } from "../firebase/data";
import { conferenceSectionPath, contentPath, personPath } from "../lib/routes";

const route = useRoute();
const router = useRouter();
const { conference } = useConferenceContext();
const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const contentItems = ref<Content[]>([]);
const people = ref<Person[]>([]);
const organizations = ref<Organization[]>([]);
const loading = ref(true);
const error = ref("");
const needle = computed(() => query.value.trim().toLowerCase());
const contentResults = computed(() =>
  !needle.value
    ? []
    : contentItems.value
        .filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(needle.value))
        .slice(0, 30),
);
const peopleResults = computed(() =>
  !needle.value
    ? []
    : people.value
        .filter((item) =>
          `${item.name} ${item.title} ${item.description}`.toLowerCase().includes(needle.value),
        )
        .slice(0, 20),
);
const organizationResults = computed(() =>
  !needle.value
    ? []
    : organizations.value
        .filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(needle.value))
        .slice(0, 20),
);
const total = computed(
  () => contentResults.value.length + peopleResults.value.length + organizationResults.value.length,
);
watch(
  conference,
  async (current) => {
    if (!current) return;
    loading.value = true;
    try {
      [contentItems.value, people.value, organizations.value] = await Promise.all([
        getAllContent(current.code),
        getSpeakers(current.code),
        getOrganizations(current.code),
      ]);
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : "Failed to load search data";
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
watch(query, (value) => {
  const next = { ...route.query };
  if (value.trim()) next.q = value;
  else delete next.q;
  void router.replace({ query: next });
});
watch(
  () => route.query.q,
  (value) => {
    const next = typeof value === "string" ? value : "";
    if (query.value !== next) query.value = next;
  },
);
watchEffect(() => {
  if (conference.value) document.title = `Search · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content search-page">
    <header>
      <p class="kicker">Global search</p>
      <h1 tabindex="-1">Search {{ conference.name }}</h1>
      <p>Search content, people, and organizations.</p>
    </header>
    <label class="search-control"
      ><span class="visually-hidden">Search conference</span
      ><input
        v-model="query"
        class="input focus-ring"
        type="search"
        placeholder="Search the conference..."
        autofocus
    /></label>
    <PageState v-if="loading" kind="loading" message="Preparing search..." />
    <PageState v-else-if="error" kind="error" title="Search unavailable" :message="error" />
    <PageState
      v-else-if="!needle"
      kind="empty"
      message="Enter a title, person, group, or keyword."
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
  padding-block: var(--section-space);
}
.kicker {
  color: var(--accent-success);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
h1 {
  margin-top: 0.2rem;
  font-size: clamp(2rem, 5vw, 3.25rem);
}
header > p:last-child {
  margin-top: var(--space-2);
  color: var(--text-muted);
}
.search-control {
  display: block;
  margin-top: var(--space-6);
}
.search-control input {
  width: 100%;
  min-height: 3.25rem;
  font-size: 1.05rem;
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
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  padding: 0.1rem 0.5rem;
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
