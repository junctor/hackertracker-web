<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { ConferenceDocument } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getDocument } from "../firebase/data";
import { formatDateTime, toIsoDateTime } from "../lib/dates";
import { friendlyLoadError } from "../lib/errors";
import { conferenceMenuPath, parseNumericParam } from "../lib/routes";

const route = useRoute();
const { conference } = useConferenceContext();
const documentId = computed(() => parseNumericParam(route.params.documentId));
const currentDocument = ref<ConferenceDocument | null>(null);
const loading = ref(true);
const error = ref("");
const updated = computed(() => {
  const value = currentDocument.value?.updatedAt;
  if (!value) return null;
  const dateTime = toIsoDateTime(value);
  const label = formatDateTime(value, conference.value?.timezone, { dateStyle: "medium" });
  return dateTime && label ? { dateTime, label } : null;
});
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
      error.value = friendlyLoadError(reason, "this document");
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
    <PageState v-if="loading" kind="loading" message="Getting the document…" />
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
        <h1 tabindex="-1">{{ currentDocument.titleText }}</h1>
        <time v-if="updated" :datetime="updated.dateTime">Updated {{ updated.label }}</time>
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
header {
  margin-top: var(--space-6);
}
h1 {
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
