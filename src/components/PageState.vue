<script setup lang="ts">
import { CircleAlert, Inbox, LoaderCircle } from "@lucide/vue";

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
    <LoaderCircle v-if="kind === 'loading'" class="state-icon loading-icon" aria-hidden="true" />
    <CircleAlert v-else-if="kind === 'error'" class="state-icon error-icon" aria-hidden="true" />
    <Inbox v-else class="state-icon" aria-hidden="true" />
    <h1 v-if="title || kind" tabindex="-1">
      {{
        title ??
        (kind === "loading"
          ? "Loading"
          : kind === "error"
            ? "Something went wrong"
            : "Nothing here yet")
      }}
    </h1>
    <p v-if="message || kind === 'loading'">
      {{ message ?? "Getting the latest information…" }}
    </p>
    <slot />
  </section>
</template>

<style scoped>
.page-state {
  display: flex;
  width: min(42rem, calc(100% - 2rem));
  min-height: 15rem;
  margin: 3rem auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6);
  color: var(--text-muted);
  text-align: center;
}

.state-icon {
  width: 2rem;
  height: 2rem;
  color: var(--text-subtle);
  stroke-width: 1.7;
}

.loading-icon {
  color: var(--accent-success);
  animation: spin 1s linear infinite;
}

.error-icon {
  color: var(--critical);
}

h1 {
  color: var(--text-primary);
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.2;
}

p {
  max-width: 36rem;
  text-wrap: pretty;
}

:slotted(.state-actions) {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
