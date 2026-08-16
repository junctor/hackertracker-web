<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { ConferenceDocument } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getDocument } from "../firebase/data";
import { toDate } from "../lib/dates";
import { conferenceMenuPath, parseNumericParam } from "../lib/routes";

const route = useRoute();
const { conference } = useConferenceContext();
const documentId = computed(() => parseNumericParam(route.params.documentId));
const currentDocument = ref<ConferenceDocument | null>(null);
const loading = ref(true);
const error = ref("");
watch(
  [conference, documentId],
  async ([current, id]) => {
    if (!current || !id) {
      error.value = "Invalid document ID.";
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      currentDocument.value = await getDocument(current.code, id);
      if (!currentDocument.value) error.value = "Document not found.";
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : "Failed to load document";
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (conference.value)
    document.title = `${currentDocument.value?.titleText || "Document"} · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <article v-if="conference" class="container page-content document-page">
    <PageState v-if="loading" kind="loading" message="Loading document..." />
    <PageState
      v-else-if="error || !currentDocument"
      kind="error"
      title="Document not found"
      :message="error"
    />
    <template v-else>
      <RouterLink class="back-link focus-ring" :to="conferenceMenuPath(conference.code)"
        >← Conference menu</RouterLink
      >
      <header>
        <p class="kicker">Conference document</p>
        <h1 tabindex="-1">{{ currentDocument.titleText }}</h1>
        <time
          v-if="toDate(currentDocument.updatedAt)"
          :datetime="toDate(currentDocument.updatedAt)!.toISOString()"
          >Updated
          {{
            toDate(currentDocument.updatedAt)!.toLocaleDateString(undefined, {
              dateStyle: "medium",
            })
          }}</time
        >
      </header>
      <div class="document-body"><MarkdownContent :content="currentDocument.bodyText" /></div>
    </template>
  </article>
</template>

<style scoped>
.document-page {
  max-width: 54rem;
  padding-block: var(--section-space);
}
.back-link {
  display: inline-flex;
  color: var(--accent-success);
  font-weight: 700;
}
header {
  margin-top: var(--space-6);
}
.kicker {
  color: var(--accent-success);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
h1 {
  margin-top: var(--space-2);
  font-size: clamp(2rem, 6vw, 3.5rem);
  line-height: 1.05;
  text-wrap: balance;
}
time {
  display: block;
  margin-top: var(--space-3);
  color: var(--text-subtle);
  font-size: 0.8rem;
}
.document-body {
  margin-top: var(--space-8);
  border-top: 1px solid var(--border);
  padding-top: var(--space-6);
}
</style>
