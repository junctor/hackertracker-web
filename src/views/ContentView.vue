<script setup lang="ts">
import { ArrowLeft, Bookmark, Calendar, ExternalLink, Share2, Users } from "@lucide/vue";
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Content, Location, Person, TagGroup } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import SessionCard from "../components/SessionCard.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import {
  getCachedContent,
  getCachedLocations,
  getCachedTags,
  getContent,
  getLocations,
  getSpeakersByIds,
  getTags,
} from "../firebase/data";
import { toggleBookmark, loadBookmarks } from "../lib/bookmarks";
import { generateCalendar } from "../lib/calendar";
import { formatScheduleTime } from "../lib/dates";
import { friendlyLoadError } from "../lib/errors";
import { contentPath, parseNumericParam, personPath, schedulePath } from "../lib/routes";
import {
  getAccentColor,
  getContentPersonIds,
  getDisplayTags,
  sortedSessions,
} from "../lib/schedule";

const route = useRoute();
const { conference } = useConferenceContext();
const content = ref<Content | null>(null);
const people = ref<Person[]>([]);
const tags = ref<TagGroup[]>([]);
const locations = ref<Location[]>([]);
const loading = ref(true);
const error = ref("");
const bookmarked = ref(false);
let request = 0;

const code = computed(() => conference.value?.code);
const contentId = computed(() => parseNumericParam(route.params.contentId));
const sessions = computed(() => (content.value ? sortedSessions(content.value) : []));
const displayTags = computed(() =>
  content.value ? getDisplayTags(content.value, tags.value) : [],
);
const accentColor = computed(() =>
  content.value ? (getAccentColor(content.value, tags.value) ?? "#9ca3af") : "#9ca3af",
);
const locationById = computed(() => new Map(locations.value.map((item) => [item.id, item])));
const speakerNames = computed(() =>
  content.value
    ? getContentPersonIds(content.value)
        .map((id) => people.value.find((person) => person.id === id)?.name)
        .filter(Boolean)
        .join(", ")
    : "",
);

watchEffect(() => {
  document.title =
    error.value && !conference.value
      ? "Error · Content | Hacker Tracker"
      : conference.value && content.value
        ? `${content.value.title} · ${conference.value.name} | Hacker Tracker`
        : "Loading content… | Hacker Tracker";
});

watch(
  [code, contentId],
  async ([conferenceCode, id]) => {
    const current = ++request;
    if (!conferenceCode || !id) {
      error.value = "This link is missing a valid conference or session.";
      loading.value = false;
      return;
    }
    error.value = "";
    bookmarked.value = loadBookmarks(conferenceCode).has(id);
    const cachedContent = getCachedContent(conferenceCode, id);
    const cachedTags = getCachedTags(conferenceCode);
    if (cachedContent && cachedTags) {
      content.value = cachedContent;
      tags.value = cachedTags;
      locations.value = getCachedLocations(conferenceCode) ?? [];
      people.value = [];
      loading.value = false;
    } else {
      content.value = null;
      tags.value = [];
      locations.value = [];
      people.value = [];
      loading.value = true;
    }
    try {
      const loadedContent = await getContent(conferenceCode, id);
      if (!loadedContent) throw new Error("Content not found");
      const personIds = getContentPersonIds(loadedContent);
      const [loadedTags, loadedPeople, loadedLocations] = await Promise.all([
        getTags(conferenceCode),
        getSpeakersByIds(conferenceCode, personIds),
        getLocations(conferenceCode),
      ]);
      if (current !== request) return;
      content.value = loadedContent;
      tags.value = loadedTags;
      people.value = loadedPeople;
      locations.value = loadedLocations;
    } catch (reason) {
      if (current === request) error.value = friendlyLoadError(reason, "this session");
    } finally {
      if (current === request) loading.value = false;
    }
  },
  { immediate: true },
);

function handleBookmark(): void {
  if (!code.value || !content.value) return;
  bookmarked.value = toggleBookmark(code.value, content.value.id).has(content.value.id);
}

async function handleShare(): Promise<void> {
  if (!code.value || !content.value) return;
  const url = new URL(contentPath(code.value, content.value.id), window.location.origin).toString();
  try {
    if (navigator.share) {
      await navigator.share({ title: content.value.title, url });
      return;
    }
  } catch {
    // A dismissed native share sheet falls back to copying the URL.
  }
  await navigator.clipboard.writeText(url);
}

function addToCalendar(sessionId: number): void {
  if (!conference.value || !content.value) return;
  const session = sessions.value.find((item) => item.session_id === sessionId);
  if (!session) return;
  const calendar = generateCalendar(
    content.value,
    session,
    conference.value,
    locationById.value.get(session.location_id)?.name,
    speakerNames.value,
  );
  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `conf-${conference.value.code}-event-${content.value.id}-${session.session_id}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div>
    <PageState
      v-if="loading && !conference && !content"
      kind="loading"
      message="Getting session details…"
    />
    <PageState
      v-else-if="error && (!conference || !content)"
      kind="error"
      title="Session unavailable"
      :message="error"
    />
    <article
      v-else-if="conference && content"
      class="container detail-page"
      aria-labelledby="content-title"
      :style="{ '--content-color': accentColor }"
    >
      <header class="detail-hero">
        <div class="detail-actions">
          <RouterLink
            class="button icon-label-button focus-ring"
            :to="schedulePath(conference.code)"
          >
            <ArrowLeft aria-hidden="true" /><span>Schedule</span>
          </RouterLink>
          <div>
            <button
              type="button"
              class="icon-button focus-ring"
              title="Share"
              aria-label="Share event link"
              @click="handleShare"
            >
              <Share2 aria-hidden="true" />
            </button>
            <button
              type="button"
              class="icon-button focus-ring"
              :aria-pressed="bookmarked"
              :aria-label="`${bookmarked ? 'Remove' : 'Add'} bookmark for ${content.title}`"
              @click="handleBookmark"
            >
              <Bookmark aria-hidden="true" :fill="bookmarked ? 'currentColor' : 'none'" />
            </button>
          </div>
        </div>
        <h1 id="content-title" tabindex="-1">{{ content.title }}</h1>
        <ul v-if="displayTags.length" class="tag-list">
          <li
            v-for="tag in displayTags.slice(0, 3)"
            :key="tag.id"
            class="tag"
            :style="{
              backgroundColor: tag.color_background ?? undefined,
              color: tag.color_foreground ?? undefined,
            }"
          >
            {{ tag.label }}
          </li>
          <li v-if="displayTags.length > 3" class="tag tag--more">
            +{{ displayTags.length - 3 }} more
          </li>
        </ul>
      </header>

      <section v-if="sessions.length" class="detail-section" aria-labelledby="sessions-title">
        <h2 id="sessions-title">Sessions</h2>
        <ul class="stack-list">
          <li v-for="session in sessions" :key="session.session_id">
            <SessionCard
              accent="content"
              :accent-color="accentColor"
              :title="content.title"
              :begin="
                formatScheduleTime(
                  session.begin_tsz,
                  session.timezone_name || conference.timezone || 'UTC',
                  true,
                )
              "
              :end="
                formatScheduleTime(
                  session.end_tsz,
                  session.timezone_name || conference.timezone || 'UTC',
                )
              "
              :begin-date-time="new Date(session.begin_tsz).toISOString()"
              :end-date-time="new Date(session.end_tsz).toISOString()"
              :people="speakerNames"
              :location="locationById.get(session.location_id)?.name"
            >
              <template #actions>
                <button
                  type="button"
                  class="icon-button focus-ring"
                  title="Add session to calendar"
                  aria-label="Add session to calendar"
                  @click="addToCalendar(session.session_id)"
                >
                  <Calendar aria-hidden="true" />
                </button>
              </template>
            </SessionCard>
          </li>
        </ul>
      </section>

      <section
        v-if="content.description"
        class="detail-section"
        aria-labelledby="description-title"
      >
        <h2 id="description-title">Description</h2>
        <div class="card detail-copy"><MarkdownContent :content="content.description" /></div>
      </section>
      <section v-if="content.links?.length" class="detail-section" aria-labelledby="links-title">
        <h2 id="links-title">Links</h2>
        <ul class="stack-list small-gap">
          <li v-for="link in content.links" :key="link.url">
            <a
              class="resource-link focus-ring"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              ><span>{{ link.label }}</span
              ><ExternalLink aria-hidden="true"
            /></a>
          </li>
        </ul>
      </section>
      <section v-if="content.media?.length" class="detail-section" aria-labelledby="media-title">
        <h2 id="media-title">Media</h2>
        <ul class="resource-list">
          <li v-for="media in content.media" :key="`${media.name}-${media.url}`">
            <a
              class="resource-link focus-ring"
              :href="media.url"
              target="_blank"
              rel="noopener noreferrer"
              ><span>{{ media.name }}</span
              ><ExternalLink aria-hidden="true"
            /></a>
          </li>
        </ul>
      </section>
      <section
        v-if="content.related_content_ids?.length"
        class="detail-section"
        aria-labelledby="related-title"
      >
        <h2 id="related-title">Related</h2>
        <ul class="resource-list">
          <li v-for="id in content.related_content_ids" :key="id">
            <RouterLink class="plain-link focus-ring" :to="contentPath(conference.code, id)"
              >Content {{ id }}</RouterLink
            >
          </li>
        </ul>
      </section>
      <section v-if="people.length" class="detail-section" aria-labelledby="people-title">
        <h2 id="people-title">People</h2>
        <div class="detail-copy simple-copy">
          <ul class="resource-list">
            <li v-for="person in people" :key="person.id">
              <RouterLink class="plain-link focus-ring" :to="personPath(conference.code, person.id)"
                ><Users aria-hidden="true" />{{ person.name }}</RouterLink
              >
            </li>
          </ul>
        </div>
      </section>
    </article>
  </div>
</template>
