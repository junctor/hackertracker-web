<script setup lang="ts">
import { Share2, Users } from "@lucide/vue";
import { computed, ref, shallowRef, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Content, Location, Person, TagGroup } from "../types/hackertracker";

import ExternalLinkList from "../components/ExternalLinkList.vue";
import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import ScheduleSessionCard from "../components/ScheduleSessionCard.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import {
  getCachedContent,
  getCachedLocations,
  getCachedSpeakers,
  getCachedTags,
  getContentByIds,
  getContent,
  getLocations,
  getSpeakersByIds,
  getTags,
} from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { contentPath, parseNumericParam, personPath, schedulePath } from "../lib/routes";
import {
  getAccentColor,
  getContentPersonIds,
  getDisplayTags,
  processScheduleData,
} from "../lib/schedule";
import { safeExternalLinks } from "../lib/urls";

const route = useRoute();
const { conference } = useConferenceContext();
const content = ref<Content | null>(null);
const people = shallowRef<Person[]>([]);
const tags = shallowRef<TagGroup[]>([]);
const locations = shallowRef<Location[]>([]);
const relatedContent = shallowRef<Content[]>([]);
const loading = ref(true);
const error = ref("");
const shareStatus = ref("");
let request = 0;

const code = computed(() => conference.value?.code);
const contentId = computed(() => parseNumericParam(route.params.contentId));
const sessions = computed(() =>
  content.value
    ? processScheduleData(
        [content.value],
        tags.value,
        people.value,
        locations.value,
        conference.value?.timezone || "UTC",
      )
    : [],
);
const displayTags = computed(() =>
  content.value ? getDisplayTags(content.value, tags.value) : [],
);
const accentColor = computed(() =>
  content.value ? (getAccentColor(content.value, tags.value) ?? "#9ca3af") : "#9ca3af",
);
const links = computed(() => safeExternalLinks(content.value?.links ?? []));
const mediaItems = computed(() => safeExternalLinks(content.value?.media ?? []));

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
    const cachedContent = getCachedContent(conferenceCode, id);
    const cachedTags = getCachedTags(conferenceCode);
    if (cachedContent && cachedTags) {
      content.value = cachedContent;
      tags.value = cachedTags;
      locations.value = getCachedLocations(conferenceCode) ?? [];
      const byId = new Map(
        (getCachedSpeakers(conferenceCode) ?? []).map((person) => [person.id, person]),
      );
      people.value = getContentPersonIds(cachedContent, [...byId.values()])
        .map((personId) => byId.get(personId))
        .filter((person): person is Person => Boolean(person));
      relatedContent.value = (cachedContent.related_content_ids ?? [])
        .map((relatedId) => getCachedContent(conferenceCode, relatedId))
        .filter((item): item is Content => Boolean(item));
      loading.value = false;
    } else {
      content.value = null;
      tags.value = [];
      locations.value = [];
      people.value = [];
      relatedContent.value = [];
      loading.value = true;
    }
    try {
      const [loadedContent, loadedTags, loadedLocations] = await Promise.all([
        getContent(conferenceCode, id),
        getTags(conferenceCode),
        getLocations(conferenceCode),
      ]);
      if (!loadedContent) throw new Error("Content not found");
      const personIds = getContentPersonIds(loadedContent);
      const [loadedPeople, loadedRelatedContent] = await Promise.all([
        getSpeakersByIds(conferenceCode, personIds),
        getContentByIds(conferenceCode, loadedContent.related_content_ids ?? []),
      ]);
      if (current !== request) return;
      content.value = loadedContent;
      tags.value = loadedTags;
      const peopleById = new Map(loadedPeople.map((person) => [person.id, person]));
      people.value = getContentPersonIds(loadedContent, loadedPeople)
        .map((personId) => peopleById.get(personId))
        .filter((person): person is Person => Boolean(person));
      locations.value = loadedLocations;
      relatedContent.value = loadedRelatedContent;
    } catch (reason) {
      if (current === request) error.value = friendlyLoadError(reason, "this session");
    } finally {
      if (current === request) loading.value = false;
    }
  },
  { immediate: true },
);

async function handleShare(): Promise<void> {
  if (!code.value || !content.value) return;
  const url = new URL(contentPath(code.value, content.value.id), window.location.origin).toString();
  try {
    if (navigator.share) {
      await navigator.share({ title: content.value.title, url });
      shareStatus.value = "Event shared.";
      return;
    }
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError") return;
  }
  try {
    if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(url);
    shareStatus.value = "Event link copied.";
  } catch {
    shareStatus.value = "Couldn’t copy the event link.";
  }
}
</script>

<template>
  <div>
    <PageState v-if="loading && !content" kind="loading" message="Getting session details…" />
    <PageState
      v-else-if="error && !content"
      kind="error"
      title="Session unavailable"
      :message="error"
      retry
    />
    <article
      v-else-if="conference && content"
      class="container detail-page"
      aria-labelledby="content-title"
      :style="{ '--content-color': accentColor }"
    >
      <header class="detail-hero">
        <div class="detail-actions">
          <RouterLink class="back-link focus-ring" :to="schedulePath(conference.code)"
            >← Schedule</RouterLink
          >
          <div>
            <button
              type="button"
              class="icon-button focus-ring"
              aria-label="Share event link"
              @click="handleShare"
            >
              <Share2 aria-hidden="true" />
            </button>
            <p class="share-status" role="status" aria-live="polite">{{ shareStatus }}</p>
          </div>
        </div>
        <h1 id="content-title" tabindex="-1">{{ content.title }}</h1>
        <ul v-if="displayTags.length" class="tag-list">
          <li
            v-for="tag in displayTags.slice(0, 3)"
            :key="tag.id"
            class="tag"
            :style="{
              '--tag-color': tag.color_background || 'var(--brand-cyan)',
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
          <li v-for="session in sessions" :key="session.sessionId">
            <ScheduleSessionCard :conference="conference" :session="session" :link="false" />
          </li>
        </ul>
      </section>

      <section
        v-if="content.description"
        class="detail-section"
        aria-labelledby="description-title"
      >
        <h2 id="description-title">Description</h2>
        <div class="detail-copy"><MarkdownContent :content="content.description" /></div>
      </section>
      <section v-if="links.length" class="detail-section" aria-labelledby="links-title">
        <h2 id="links-title">Links</h2>
        <ExternalLinkList :items="links" />
      </section>
      <section v-if="mediaItems.length" class="detail-section" aria-labelledby="media-title">
        <h2 id="media-title">Media</h2>
        <ExternalLinkList :items="mediaItems" />
      </section>
      <section v-if="relatedContent.length" class="detail-section" aria-labelledby="related-title">
        <h2 id="related-title">Related</h2>
        <ul class="resource-list">
          <li v-for="item in relatedContent" :key="item.id">
            <RouterLink class="plain-link focus-ring" :to="contentPath(conference.code, item.id)">{{
              item.title
            }}</RouterLink>
          </li>
        </ul>
      </section>
      <section v-if="people.length" class="detail-section" aria-labelledby="people-title">
        <h2 id="people-title">People</h2>
        <ul class="resource-list">
          <li v-for="person in people" :key="person.id">
            <RouterLink class="plain-link focus-ring" :to="personPath(conference.code, person.id)"
              ><Users aria-hidden="true" />{{ person.name }}</RouterLink
            >
          </li>
        </ul>
      </section>
    </article>
  </div>
</template>

<style scoped src="../styles/content.css"></style>

<style scoped>
.detail-hero > .tag-list {
  margin-top: 0.9rem;
}

.share-status {
  min-height: 1.2em;
  margin-top: var(--space-1);
  color: var(--text-muted);
  font-size: 0.75rem;
  text-align: right;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  gap: var(--space-2);
}

.tag {
  max-width: 100%;
  overflow: hidden;
  border: 1px solid color-mix(in oklab, var(--tag-color), white 8%);
  border-radius: var(--radius-pill);
  background: color-mix(in oklab, var(--tag-color) 24%, var(--surface-elevated));
  padding: 0.15rem 0.5rem;
  color: var(--text-primary);
  font-size: 0.72rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag--more {
  border-color: var(--border);
  background: transparent;
  color: var(--text-subtle);
}

.resource-list {
  display: grid;
  list-style: none;
  gap: 0.2rem;
}

.plain-link {
  display: inline-flex;
  min-height: var(--control-min);
  align-items: center;
  gap: 0.4rem;
  padding-block: 0.4rem;
  color: var(--accent-success);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.plain-link:hover {
  color: var(--text-primary);
}

.plain-link svg {
  width: 1.1rem;
  height: 1.1rem;
}
</style>
