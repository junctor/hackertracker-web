<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Person } from "../types/hackertracker";

import AppIcon from "../components/AppIcon.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getSpeakers } from "../firebase/data";
import { normalizeConferenceCode, personPath } from "../lib/routes";

const route = useRoute();
const { conference } = useConferenceContext();
const people = ref<Person[]>([]);
const loading = ref(true);
const error = ref("");
const query = ref("");
const sort = ref<"name-asc" | "name-desc">("name-asc");
const brokenAvatars = ref(new Set<number>());
const collator = new Intl.Collator(undefined, { sensitivity: "base" });
let request = 0;

const code = computed(() => normalizeConferenceCode(route.params.confCode));
const filtered = computed(() => {
  const needle = query.value.toLowerCase().trim();
  const result = needle
    ? people.value.filter((person) =>
        [
          person.name,
          person.title,
          ...(person.affiliations ?? []).flatMap((item) => [item.organization, item.title]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
    : [...people.value];
  return result.sort(
    (a, b) => (sort.value === "name-asc" ? 1 : -1) * collator.compare(a.name, b.name),
  );
});

watchEffect(() => {
  document.title = conference.value
    ? `People · ${conference.value.name} | Hacker Tracker`
    : "Loading people | Hacker Tracker";
});
watch(
  code,
  async (conferenceCode) => {
    const current = ++request;
    if (!conferenceCode) {
      error.value = "Missing required URL parameters.";
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      const loadedPeople = await getSpeakers(conferenceCode);
      if (current !== request) return;
      people.value = loadedPeople;
    } catch (reason) {
      if (current === request)
        error.value = reason instanceof Error ? reason.message : "Failed to load people";
    } finally {
      if (current === request) loading.value = false;
    }
  },
  { immediate: true },
);

const text = (value?: string | null) => (typeof value === "string" ? value.trim() : "");
const displayName = (person: Person) => text(person.name).replace(/\s+/g, " ") || "Unknown person";
const initials = (person: Person) =>
  displayName(person)
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
const avatarUrl = (person: Person) => text(person.avatar?.url) || null;
const affiliation = (person: Person) => {
  const first = person.affiliations?.find((item) => text(item.title) || text(item.organization));
  if (!first) return null;
  return [text(first.title), text(first.organization)].filter(Boolean).join(" @ ");
};
const palette = ["#017FA4", "#2D7FF9", "#0F766E", "#7C3AED", "#C2410C", "#0E7490"];
const accent = (person: Person) => {
  let hash = 0;
  for (const character of displayName(person)) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length] ?? palette[0];
};
function markBroken(id: number): void {
  brokenAvatars.value = new Set([...brokenAvatars.value, id]);
}
function highlightedName(person: Person): { before: string; match: string; after: string } {
  const name = displayName(person);
  const needle = query.value.trim();
  const index = name.toLowerCase().indexOf(needle.toLowerCase());
  return !needle || index < 0
    ? { before: name, match: "", after: "" }
    : {
        before: name.slice(0, index),
        match: name.slice(index, index + needle.length),
        after: name.slice(index + needle.length),
      };
}
</script>

<template>
  <div>
    <PageState v-if="loading" kind="loading" message="Loading people..." />
    <PageState v-else-if="error" kind="error" title="We couldn't load this page" :message="error" />
    <section v-else-if="conference && code" class="container wide page-content">
      <div class="people-heading">
        <div class="title-with-count">
          <h1 tabindex="-1">People</h1>
          <span class="count" aria-live="polite"
            >{{ filtered.length.toLocaleString() }}
            {{ filtered.length === 1 ? "result" : "results" }}</span
          >
        </div>
        <form class="people-controls" role="search" @submit.prevent>
          <label class="search-field"
            ><AppIcon name="search" /><input
              v-model="query"
              class="input focus-ring"
              type="search"
              placeholder="Search people..."
              aria-label="Search people"
          /></label>
          <label
            ><span class="visually-hidden">Sort people</span
            ><select v-model="sort" class="input select focus-ring">
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select></label
          >
        </form>
      </div>
      <div v-if="!filtered.length" class="empty-state people-empty">
        <h2>No people found</h2>
        <p v-if="query.trim()">No people found for “{{ query.trim() }}”.</p>
        <p v-else>When people are added, they will appear here.</p>
        <button v-if="query.trim()" type="button" class="button focus-ring" @click="query = ''">
          Clear search
        </button>
      </div>
      <ul v-else class="people-grid">
        <li v-for="person in filtered" :key="person.id">
          <article
            class="card interactive accent-card person-card"
            :style="{ '--content-color': accent(person) }"
          >
            <span class="accent-rail" aria-hidden="true" />
            <RouterLink class="person-card-link focus-ring" :to="personPath(code, person.id)">
              <span
                class="avatar"
                :style="{
                  backgroundImage: `linear-gradient(135deg, ${accent(person)}22, rgba(15, 23, 42, .9))`,
                }"
              >
                <img
                  v-if="avatarUrl(person) && !brokenAvatars.has(person.id)"
                  :src="avatarUrl(person)!"
                  alt=""
                  loading="lazy"
                  @error="markBroken(person.id)"
                />
                <span v-else>{{ initials(person) }}</span>
              </span>
              <span class="person-card-copy"
                ><strong
                  ><template v-for="part in [highlightedName(person)]" :key="part.before"
                    ><span>{{ part.before }}</span
                    ><mark v-if="part.match">{{ part.match }}</mark
                    ><span>{{ part.after }}</span></template
                  ></strong
                ><span v-if="text(person.title)">{{ text(person.title) }}</span
                ><span v-else-if="affiliation(person)">{{ affiliation(person) }}</span></span
              >
            </RouterLink>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>
