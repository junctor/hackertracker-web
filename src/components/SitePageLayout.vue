<script setup lang="ts">
import SiteFooter from "./SiteFooter.vue";
import SiteHeader from "./SiteHeader.vue";

defineProps<{
  centered?: boolean;
  mainClass?: string;
  staticPage?: boolean;
}>();
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main id="main" class="main-grow" :class="[mainClass, { centered, 'static-page': staticPage }]">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.static-page :deep(.static-hero) {
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  padding-block: clamp(3rem, 7vw, 4rem);
}

.static-page :deep(.static-hero h1) {
  font-size: clamp(1.8rem, 5vw, 2.2rem);
}

.static-page :deep(.lead) {
  max-width: 48rem;
  margin-top: 0.75rem;
  color: #cbd5e1;
}

.static-page :deep(.static-content) {
  display: grid;
  gap: 3rem;
  padding-block: 2.5rem;
}

.static-page :deep(.static-content section > h2),
.static-page :deep(.section-title-row h2) {
  font-size: 1.15rem;
}

.static-page :deep(a:not(.button)) {
  color: var(--accent-success);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, var(--accent-success), transparent 50%);
  text-underline-offset: 0.18em;
}

.static-page :deep(a:not(.button):hover) {
  color: white;
}

.centered {
  display: grid;
  place-items: center;
  padding: 2rem;
  text-align: center;
}

.centered :deep(h1) {
  font-size: clamp(2.2rem, 8vw, 4rem);
}

.centered :deep(p) {
  margin-top: 1rem;
  color: var(--text-muted);
}

.centered :deep(.state-actions) {
  justify-content: center;
  margin-top: 2rem;
}
</style>
