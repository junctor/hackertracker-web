<script setup lang="ts">
defineProps<{ kind?: "loading" | "error" | "empty"; title?: string; message?: string }>();
</script>

<template>
  <section
    class="page-state"
    :class="`page-state--${kind ?? 'empty'}`"
    :role="kind === 'loading' ? 'status' : kind === 'error' ? 'alert' : undefined"
    :aria-live="kind === 'loading' ? 'polite' : undefined"
    :aria-busy="kind === 'loading' ? 'true' : undefined"
  >
    <div v-if="kind === 'loading'" class="loading-mark" aria-hidden="true">HT</div>
    <h1 v-if="title" tabindex="-1">{{ title }}</h1>
    <p>{{ message ?? (kind === "loading" ? "Fetching content…" : "") }}</p>
    <slot />
  </section>
</template>
