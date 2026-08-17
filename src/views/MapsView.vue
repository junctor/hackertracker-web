<script setup lang="ts">
import { ExternalLink } from "@lucide/vue";
import { computed, ref, watchEffect } from "vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";

const { conference } = useConferenceContext();
const broken = ref(new Set<number>());
const maps = computed(() =>
  [...(conference.value?.maps ?? [])].sort(
    (a, b) =>
      a.sort_order - b.sort_order || (a.name_text || a.name).localeCompare(b.name_text || b.name),
  ),
);
const name = (map: (typeof maps.value)[number]) =>
  map.name_text?.trim() || map.name?.trim() || "Unnamed map";
const safeUrl = (value: string) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
};
watchEffect(() => {
  if (conference.value) document.title = `Maps · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content maps-page">
    <header>
      <p class="kicker">Venue Guide</p>
      <h1 tabindex="-1">{{ conference.name }} Maps</h1>
      <p>Venue maps for {{ conference.name }}.</p>
    </header>
    <PageState
      v-if="!maps.length"
      kind="empty"
      message="No maps are available for this conference yet."
    />
    <ul v-else class="map-grid">
      <li v-for="map in maps" :key="map.id">
        <article>
          <div>
            <h2>{{ name(map) }}</h2>
            <p v-if="map.description">{{ map.description }}</p>
            <small v-if="map.filename || map.file">{{ map.filename || map.file }}</small>
          </div>
          <div v-if="safeUrl(map.svg_url) && !broken.has(map.id)" class="map-preview">
            <img
              :src="safeUrl(map.svg_url)!"
              :alt="`Preview of ${name(map)}`"
              @error="broken = new Set([...broken, map.id])"
            />
          </div>
          <div v-if="safeUrl(map.url)" class="map-actions">
            <a
              class="button focus-ring"
              :href="safeUrl(map.url)!"
              target="_blank"
              rel="noopener noreferrer"
              >Open Map <ExternalLink aria-hidden="true"
            /></a>
          </div>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.maps-page {
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
.map-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  gap: var(--space-5);
  margin-top: var(--space-6);
}
article {
  display: grid;
  min-width: 0;
  gap: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  padding: var(--space-4);
}
article p,
article small {
  display: block;
  margin-top: var(--space-2);
  color: var(--text-muted);
  overflow-wrap: anywhere;
}

.map-preview {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  background: white;
}

img {
  display: block;
  width: 100%;
  max-height: min(70vh, 34rem);
  object-fit: contain;
}

.map-actions {
  padding-top: var(--space-4);
}

.map-actions .button {
  gap: var(--space-2);
}

.map-actions svg {
  width: 1rem;
  height: 1rem;
}
</style>
