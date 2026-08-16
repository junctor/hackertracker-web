<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Person, ScheduledContent } from "../types/hackertracker";

import AppIcon from "../components/AppIcon.vue";
import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getContentByIds, getSpeaker, getTags } from "../firebase/data";
import { contentPath, normalizeConferenceCode, parseNumericParam, peoplePath } from "../lib/routes";
import { processScheduleData } from "../lib/schedule";

const route = useRoute();
const { conference } = useConferenceContext();
const person = ref<Person | null>(null);
const sessions = ref<ScheduledContent[]>([]);
const loading = ref(true);
const error = ref("");
const avatarError = ref(false);
let request = 0;

const code = computed(() => normalizeConferenceCode(route.params.confCode));
const id = computed(() => parseNumericParam(route.params.personId));
const text = (value?: string | null) => (typeof value === "string" ? value.trim() : "");
const name = computed(() => text(person.value?.name).replace(/\s+/g, " ") || "Unknown person");
const initials = computed(() =>
  name.value
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
);
const links = computed(() =>
  [...(person.value?.links ?? [])]
    .filter((link) => {
      try {
        return ["http:", "https:"].includes(new URL(link.url).protocol);
      } catch {
        return false;
      }
    })
    .sort((a, b) => a.sort_order - b.sort_order),
);
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
const avatar = computed(() => text(person.value?.avatar?.url) || null);

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
      error.value = "Missing required URL parameters.";
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = "";
    avatarError.value = false;
    try {
      const loadedPerson = await getSpeaker(conferenceCode, personId);
      if (!loadedPerson) throw new Error("Person not found.");
      let scheduled: ScheduledContent[] = [];
      if (loadedPerson.content_ids?.length) {
        const [content, tags] = await Promise.all([
          getContentByIds(conferenceCode, loadedPerson.content_ids),
          getTags(conferenceCode),
        ]);
        scheduled = processScheduleData(content, tags, [loadedPerson]);
      }
      if (current !== request) return;
      person.value = loadedPerson;
      sessions.value = scheduled;
    } catch (reason) {
      if (current === request)
        error.value = reason instanceof Error ? reason.message : "Failed to load person";
    } finally {
      if (current === request) loading.value = false;
    }
  },
  { immediate: true },
);

function timeRange(item: ScheduledContent): string {
  const begin = new Date(item.begin);
  const end = new Date(item.end ?? item.begin);
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: conference.value?.timezone,
  }).format(begin);
  const times = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: conference.value?.timezone,
  });
  return `${date} • ${times.format(begin)} – ${times.format(end)}`;
}
</script>

<template>
  <div>
    <PageState v-if="loading" kind="loading" message="Loading person..." />
    <PageState v-else-if="error" kind="error" title="We couldn't load this page" :message="error" />
    <div v-else-if="person && conference" class="container detail-page person-detail">
      <header class="card accent-card detail-hero" :style="{ '--content-color': accent }">
        <span class="accent-rail" aria-hidden="true" />
        <RouterLink class="button icon-label-button focus-ring" :to="peoplePath(conference.code)"
          ><AppIcon name="arrow-left" /><span>People</span></RouterLink
        >
        <div class="person-hero-content">
          <span
            class="avatar avatar--large"
            :style="{
              backgroundImage: `linear-gradient(135deg, ${accent}22, rgba(15, 23, 42, .92))`,
            }"
            ><img
              v-if="avatar && !avatarError"
              :src="avatar"
              alt=""
              @error="avatarError = true"
            /><span v-else>{{ initials }}</span></span
          >
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
            <ul v-if="links.length" class="pill-list">
              <li v-for="link in links" :key="`${link.url}-${link.title}`">
                <a
                  class="pill-link focus-ring"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ link.title || link.url }}<AppIcon name="external"
                /></a>
              </li>
            </ul>
          </div>
        </div>
      </header>
      <section
        v-if="text(person.description)"
        class="detail-section"
        aria-labelledby="about-person"
      >
        <h2 id="about-person">About</h2>
        <div class="card detail-copy"><MarkdownContent :content="person.description" /></div>
      </section>
      <section v-if="sessions.length" class="detail-section" aria-labelledby="person-sessions">
        <h2 id="person-sessions">Sessions</h2>
        <ul class="stack-list">
          <li v-for="item in sessions" :key="`${item.contentId}-${item.sessionId}`">
            <article
              class="card interactive accent-card person-session"
              :style="{ '--content-color': item.color ?? accent }"
            >
              <span class="accent-rail" aria-hidden="true" /><RouterLink
                class="person-session-link focus-ring"
                :to="contentPath(conference.code, item.contentId)"
                ><h3>{{ item.title }}</h3>
                <p class="icon-text">
                  <AppIcon name="calendar" /><time :datetime="new Date(item.begin).toISOString()">{{
                    timeRange(item)
                  }}</time>
                </p>
                <p v-if="item.location" class="icon-text muted">
                  <AppIcon name="pin" />{{ item.location }}
                </p></RouterLink
              >
            </article>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
