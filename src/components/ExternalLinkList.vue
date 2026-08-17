<script setup lang="ts">
import { ExternalLink } from "@lucide/vue";

import type { SafeExternalLink } from "../lib/urls";

withDefaults(
  defineProps<{
    items: SafeExternalLink[];
    compact?: boolean;
  }>(),
  { compact: false },
);
</script>

<template>
  <ul class="link-list" :class="{ compact }">
    <li v-for="item in items" :key="item.key">
      <a class="focus-ring" :href="item.href" target="_blank" rel="noopener noreferrer">
        <span>{{ item.label }}</span>
        <ExternalLink aria-hidden="true" />
      </a>
    </li>
  </ul>
</template>

<style scoped>
.link-list {
  display: grid;
  list-style: none;
  gap: var(--space-3);
}

a {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: 1px solid var(--border);
  padding: 0.65rem 0;
  color: var(--accent-success);
  font-size: 0.9rem;
  font-weight: 600;
}

a:hover {
  color: white;
}

a span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

svg {
  width: 1.1rem;
  height: 1.1rem;
  flex: 0 0 auto;
}

.compact {
  gap: 0;
}

.compact a {
  justify-content: flex-start;
  border: 0;
  padding-block: 0.4rem;
}
</style>
