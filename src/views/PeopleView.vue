<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Person } from "../types/hackertracker";

import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import PersonAvatar from "../components/PersonAvatar.vue";
import SearchField from "../components/SearchField.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { useRouteTextQuery } from "../composables/useRouteTextQuery";
import { getSpeakers } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { normalizeConferenceCode, personPath } from "../lib/routes";
import { compareBySortOrder } from "../lib/sort";

const route = useRoute();
const { conference } = useConferenceContext();
const people = ref<Person[]>([]);
const loading = ref(true);
const error = ref("");
const query = useRouteTextQuery();
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
  return result.sort((a, b) => compareBySortOrder(a, b) || collator.compare(a.name, b.name));
});

watchEffect(() => {
  document.title = conference.value
    ? `People · ${conference.value.name} | Hacker Tracker`
    : "Loading people… | Hacker Tracker";
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
const affiliation = (person: Person) => {
  const first = person.affiliations?.find((item) => text(item.title) || text(item.organization));
  if (!first) return null;
  return [text(first.title), text(first.organization)].filter(Boolean).join(" @ ");
};
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
      <PageHeading
        title="People"
        :count="`${filtered.length.toLocaleString()} ${filtered.length === 1 ? 'result' : 'results'}`"
      >
        <form class="people-controls" role="search" @submit.prevent>
          <SearchField v-model="query" label="Search people" placeholder="Search people…" />
        </form>
      </PageHeading>
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
              <PersonAvatar :name="displayName(person)" :url="person.avatar?.url" lazy />
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

<style scoped>
.people-controls {
  width: min(20rem, 100%);
}

.people-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  list-style: none;
  gap: 1rem;
  margin-top: var(--space-6);
}

.person-card,
.person-card-link {
  height: 100%;
}

.person-card {
  border: 0;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
}

.person-card:hover,
.person-card:focus-within {
  border-color: color-mix(in oklab, var(--accent), transparent 50%);
  background: transparent;
}

.person-card-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-radius: inherit;
  padding: 1rem;
}

.person-card-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.2rem;
}

.person-card-copy strong,
.person-card-copy > span {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.person-card-copy strong {
  color: #f1f5f9;
  line-height: 1.35;
}

.person-card-copy > span {
  color: var(--text-muted);
  font-size: 0.82rem;
}

mark {
  border-radius: 0.2rem;
  background: rgb(254 240 138 / 18%);
  color: #fef08a;
}

.people-empty {
  max-width: 28rem;
  margin: 4rem auto;
}

.people-empty p {
  margin-top: 0.35rem;
  color: var(--text-muted);
}

.people-empty .button {
  margin-top: 1rem;
}

@media (width < 56.25rem) {
  .people-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width < 40rem) {
  .people-controls {
    width: 100%;
  }

  .people-grid {
    grid-template-columns: 1fr;
  }
}
</style>
