<script setup lang="ts">
import { Calendar } from "@lucide/vue";
import { computed, ref, watch, watchEffect } from "vue";
import type { Location } from "../types/hackertracker";
import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import SearchField from "../components/SearchField.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { useRouteTextQuery } from "../composables/useRouteTextQuery";
import { getAllContent, getLocations } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { filteredScheduleRoute } from "../lib/routes";
import { compareBySortOrder } from "../lib/sort";

const { conference } = useConferenceContext();
const locations = ref<Location[]>([]);
const scheduledLocationIds = ref(new Set<number>());
const query = useRouteTextQuery();
const loading = ref(true);
const error = ref("");
const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return locations.value
    .filter(
      (item) =>
        !needle || `${item.name} ${item.short_name} ${item.hotel}`.toLowerCase().includes(needle),
    )
    .sort(
      (a, b) =>
        compareBySortOrder(a, b) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }),
    );
});
const parentName = (id: number) => locations.value.find((item) => item.id === id)?.name;
watch(
  conference,
  async (current) => {
    if (!current) return;
    loading.value = true;
    error.value = "";
    scheduledLocationIds.value = new Set();
    try {
      const [loadedLocations, content] = await Promise.all([
        getLocations(current.code),
        getAllContent(current.code).catch(() => []),
      ]);
      locations.value = loadedLocations;
      scheduledLocationIds.value = new Set(
        content.flatMap((item) => item.sessions ?? []).map((session) => session.location_id),
      );
    } catch (reason) {
      error.value = friendlyLoadError(reason, "conference locations");
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (conference.value) document.title = `Locations · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content">
    <PageHeading title="Locations" intro="Rooms and venues from the schedule." />
    <SearchField
      v-model="query"
      class="page-search"
      label="Search locations"
      placeholder="Search locations…"
    />
    <PageState v-if="loading" kind="loading" message="Getting conference locations…" />
    <PageState v-else-if="error" kind="error" title="Locations unavailable" :message="error" />
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
          <RouterLink
            v-if="scheduledLocationIds.has(location.id)"
            class="icon-button focus-ring schedule-link"
            :to="filteredScheduleRoute(conference.code, { locationId: location.id })"
            :title="`View ${location.name} on the schedule`"
            :aria-label="`View ${location.name} on the schedule`"
          >
            <Calendar aria-hidden="true" />
          </RouterLink>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  list-style: none;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
article {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: var(--space-2);
  border-bottom: 1px solid var(--border);
  padding: var(--space-5) var(--space-2);
}
h2 {
  font-size: 1rem;
}
article p,
article small {
  display: block;
  color: var(--text-muted);
}
.schedule-link {
  align-self: flex-start;
  margin-top: auto;
}
.schedule-link svg {
  width: 1rem;
  height: 1rem;
}
</style>
