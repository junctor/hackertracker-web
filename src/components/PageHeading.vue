<script setup lang="ts">
defineProps<{
  title: string;
  intro?: string;
  count?: string;
}>();
</script>

<template>
  <header class="page-heading">
    <div>
      <div class="title-row">
        <h1 tabindex="-1">{{ title }}</h1>
        <span v-if="count" class="count" aria-live="polite">{{ count }}</span>
      </div>
      <p v-if="intro" class="intro">{{ intro }}</p>
    </div>
    <slot />
  </header>
</template>

<style scoped>
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
}

.title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

h1 {
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.05;
  text-wrap: balance;
}

.intro {
  margin-top: var(--space-2);
  color: var(--text-muted);
}

.count {
  color: var(--text-subtle);
  font-size: 0.8rem;
  font-weight: 650;
  white-space: nowrap;
}

@media (width < 40rem) {
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
