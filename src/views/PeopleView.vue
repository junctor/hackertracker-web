<script setup lang="ts">
import { Search } from "@lucide/vue";
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Person } from "../types/hackertracker";

import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getSpeakers } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { normalizeConferenceCode, personPath } from "../lib/routes";

const route = useRoute();
const { conference } = useConferenceContext();
const people = ref<Person[]>([]);
const loading = ref(true);
const error = ref("");
const query = ref("");
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
  return result.sort((a, b) => collator.compare(a.name, b.name));
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
      error.value = "This link is missing a valid conference.";
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
      if (current === request) error.value = friendlyLoadError(reason, "the speaker list");
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
    <PageState v-if="loading" kind="loading" message="Getting the speaker list…" />
    <PageState v-else-if="error" kind="error" title="People unavailable" :message="error" />
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
            ><Search aria-hidden="true" /><input
              v-model="query"
              class="input focus-ring"
              type="search"
              placeholder="Search people..."
              aria-label="Search people"
          /></label>
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
          <article class="card interactive person-card">
            <RouterLink class="person-card-link focus-ring" :to="personPath(code, person.id)">
              <span class="avatar">
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
