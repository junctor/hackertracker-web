<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Location } from "../types/hackertracker";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getLocations } from "../firebase/data";

const { conference } = useConferenceContext();
const route = useRoute();
const router = useRouter();
const locations = ref<Location[]>([]);
const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const loading = ref(true);
const error = ref("");
const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return locations.value
    .filter(
      (item) =>
        !needle || `${item.name} ${item.short_name} ${item.hotel}`.toLowerCase().includes(needle),
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }),
    );
});
const parentName = (id: number) => locations.value.find((item) => item.id === id)?.name;
watch(
  conference,
  async (current) => {
    if (!current) return;
    loading.value = true;
    try {
      locations.value = await getLocations(current.code);
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : "Failed to load locations";
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
  if (conference.value) document.title = `Locations · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content locations-page">
    <header>
      <p class="kicker">Venue guide</p>
      <h1 tabindex="-1">Locations</h1>
      <p>Rooms, villages, and venue references used across the schedule.</p>
    </header>
    <label class="search-control"
      ><span class="visually-hidden">Search locations</span
      ><input
        v-model="query"
        class="input focus-ring"
        type="search"
        placeholder="Search locations..."
    /></label>
    <PageState v-if="loading" kind="loading" message="Loading locations..." />
    <PageState v-else-if="error" kind="error" title="Couldn't load locations" :message="error" />
    <PageState
      v-else-if="!filtered.length"
      kind="empty"
      message="No locations match your search."
    />
    <ul v-else class="location-grid">
      <li v-for="location in filtered" :key="location.id">
        <article>
          <h2>{{ location.name }}</h2>
          <p v-if="location.short_name && location.short_name !== location.name">
            {{ location.short_name }}
          </p>
          <small v-if="parentName(location.parent_id)">{{ parentName(location.parent_id) }}</small
          ><small v-else-if="location.hotel">{{ location.hotel }}</small>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.locations-page {
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
.search-control {
  display: block;
  max-width: 34rem;
  margin-top: var(--space-6);
}
.search-control input {
  width: 100%;
}
.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  list-style: none;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
article {
  height: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  background: var(--surface-muted);
  padding: var(--space-5);
}
h2 {
  font-size: 1rem;
}
article p,
article small {
  display: block;
  margin-top: var(--space-2);
  color: var(--text-muted);
}
</style>
