<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Person, ScheduledContent } from "../types/hackertracker";

import ExternalLinkList from "../components/ExternalLinkList.vue";
import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import PersonAvatar from "../components/PersonAvatar.vue";
import ScheduleSessionCard from "../components/ScheduleSessionCard.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getContentByIds, getLocations, getSpeakers, getTags } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { normalizeConferenceCode, parseNumericParam, peoplePath } from "../lib/routes";
import { processScheduleData } from "../lib/schedule";
import { safeExternalLinks } from "../lib/urls";

const route = useRoute();
const { conference } = useConferenceContext();
const person = ref<Person | null>(null);
const sessions = ref<ScheduledContent[]>([]);
const loading = ref(true);
const error = ref("");
let request = 0;

const code = computed(() => normalizeConferenceCode(route.params.confCode));
const id = computed(() => parseNumericParam(route.params.personId));
const text = (value?: string | null) => (typeof value === "string" ? value.trim() : "");
const name = computed(() => text(person.value?.name).replace(/\s+/g, " ") || "Unknown person");
const links = computed(() => safeExternalLinks(person.value?.links ?? []));
const affiliations = computed(() =>
  (person.value?.affiliations ?? []).filter((item) => text(item.title) || text(item.organization)),
);
const palette = ["#017FA4", "#2D7FF9", "#0F766E", "#7C3AED", "#C2410C", "#0E7490"];
const accent = computed(() => {
  let hash = 0;
  for (const character of name.value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (
    sessions.value.find((item) => item.color)?.color ?? palette[hash % palette.length] ?? palette[0]
  );
});

watchEffect(() => {
  document.title = error.value
    ? "Error · Person | Hacker Tracker"
    : conference.value && person.value
      ? `${person.value.name} · ${conference.value.name} | Hacker Tracker`
      : "Loading person… | Hacker Tracker";
});
watch(
  [code, id],
  async ([conferenceCode, personId]) => {
    const current = ++request;
    if (!conferenceCode || !personId) {
      error.value = "This link is missing a valid conference or person.";
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      const loadedPeople = await getSpeakers(conferenceCode);
      const loadedPerson = loadedPeople.find((item) => item.id === personId);
      if (!loadedPerson) throw new Error("Person not found.");
      let scheduled: ScheduledContent[] = [];
      if (loadedPerson.content_ids?.length) {
        const [content, tags, locations] = await Promise.all([
          getContentByIds(conferenceCode, loadedPerson.content_ids),
          getTags(conferenceCode),
          getLocations(conferenceCode),
        ]);
        scheduled = processScheduleData(
          content,
          tags,
          loadedPeople,
          locations,
          conference.value?.timezone || "UTC",
        );
      }
      if (current !== request) return;
      person.value = loadedPerson;
      sessions.value = scheduled;
    } catch (reason) {
      if (current === request) error.value = friendlyLoadError(reason, "this person");
    } finally {
      if (current === request) loading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <PageState v-if="loading" kind="loading" message="Getting person details…" />
    <PageState v-else-if="error" kind="error" title="Person unavailable" :message="error" />
    <div v-else-if="person && conference" class="container detail-page person-detail">
      <header class="detail-hero">
        <RouterLink class="back-link focus-ring" :to="peoplePath(conference.code)"
          >← People</RouterLink
        >
        <div class="person-hero-content">
          <PersonAvatar :name="name" :url="person.avatar?.url" :accent="accent" large />
          <div class="person-identity">
            <div class="person-name">
              <h1 tabindex="-1">{{ name }}</h1>
              <span v-if="text(person.pronouns)" class="pronouns">{{ text(person.pronouns) }}</span>
            </div>
            <ul v-if="affiliations.length" class="affiliations">
              <li v-for="(item, index) in affiliations" :key="index">
                <strong v-if="text(item.title)">{{ text(item.title) }}</strong
                ><span v-if="text(item.title) && text(item.organization)"> @ </span
                >{{ text(item.organization) }}
              </li>
            </ul>
            <ExternalLinkList v-if="links.length" :items="links" compact />
          </div>
        </div>
      </header>
      <section
        v-if="text(person.description)"
        class="detail-section"
        aria-labelledby="about-person"
      >
        <h2 id="about-person">About</h2>
        <div class="detail-copy"><MarkdownContent :content="person.description" /></div>
      </section>
      <section v-if="sessions.length" class="detail-section" aria-labelledby="person-sessions">
        <h2 id="person-sessions">Sessions</h2>
        <ul class="stack-list">
          <li v-for="item in sessions" :key="`${item.contentId}-${item.sessionId}`">
            <ScheduleSessionCard :conference="conference" :session="item" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped src="../styles/content.css"></style>

<style scoped>
.person-hero-content {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.person-identity {
  display: grid;
  min-width: 0;
  gap: 0.8rem;
}

.person-name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.pronouns {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 650;
}

.affiliations {
  display: grid;
  list-style: none;
  gap: 0.25rem;
  color: #cbd5e1;
  font-size: 0.875rem;
}

@media (width < 40rem) {
  .person-hero-content {
    flex-direction: column;
  }
}
</style>
