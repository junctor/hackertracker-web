<script setup lang="ts">
import { ExternalLink } from "@lucide/vue";
import { computed, ref, watchEffect } from "vue";
import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { compareBySortOrder } from "../lib/sort";
import { safeWebUrl } from "../lib/urls";

const { conference } = useConferenceContext();
const broken = ref(new Set<number>());
const maps = computed(() =>
  [...(conference.value?.maps ?? [])]
    .map((map) => ({
      ...map,
      displayName: map.name_text?.trim() || map.name?.trim() || "Unnamed map",
      previewUrl: safeWebUrl(map.svg_url),
      href: safeWebUrl(map.url),
    }))
    .sort(
      (a, b) =>
        compareBySortOrder(a, b) ||
        a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }),
    ),
);
watchEffect(() => {
  if (conference.value) document.title = `Maps · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content">
    <PageHeading title="Maps" intro="Venue maps and floor plans." />
    <PageState
      v-if="!maps.length"
      kind="empty"
      message="No maps are available for this conference yet."
    />
    <ul v-else class="map-grid">
      <li v-for="map in maps" :key="map.id">
        <article>
          <div>
            <h2>{{ map.displayName }}</h2>
            <p v-if="map.description">{{ map.description }}</p>
            <small v-if="map.filename || map.file">{{ map.filename || map.file }}</small>
          </div>
          <div v-if="map.previewUrl && !broken.has(map.id)" class="map-preview">
            <img
              :src="map.previewUrl"
              :alt="`Preview of ${map.displayName}`"
              @error="broken = new Set([...broken, map.id])"
            />
          </div>
          <div v-if="map.href" class="map-actions">
            <a class="button focus-ring" :href="map.href" target="_blank" rel="noopener noreferrer"
              >Open Map <ExternalLink aria-hidden="true"
            /></a>
          </div>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
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
