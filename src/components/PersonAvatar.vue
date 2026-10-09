<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { safeWebUrl } from "../lib/urls";

const props = defineProps<{
  name: string;
  url?: string | null;
  large?: boolean;
  accent?: string;
  lazy?: boolean;
}>();

const failed = ref(false);
const imageUrl = computed(() => safeWebUrl(props.url));
const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
);
const background = computed(() =>
  props.accent
    ? {
        backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${props.accent}, transparent 87%), var(--surface-elevated))`,
      }
    : undefined,
);

watch(imageUrl, () => (failed.value = false));
</script>

<template>
  <span class="avatar" :class="{ large }" :style="background">
    <img
      v-if="imageUrl && !failed"
      :src="imageUrl"
      alt=""
      :loading="lazy ? 'lazy' : undefined"
      @error="failed = true"
    />
    <span v-else aria-hidden="true">{{ initials }}</span>
  </span>
</template>

<style scoped>
.avatar {
  display: flex;
  width: 3rem;
  height: 3rem;
  flex: 0 0 3rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-chrome);
  border-radius: 1rem;
  background-color: var(--surface-interactive);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.avatar.large {
  width: 7rem;
  height: 7rem;
  flex-basis: 7rem;
  border-radius: 1.2rem;
  font-size: 1.75rem;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
