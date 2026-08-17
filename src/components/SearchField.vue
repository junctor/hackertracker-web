<script setup lang="ts">
import { Search } from "@lucide/vue";

defineProps<{
  label: string;
  placeholder: string;
  large?: boolean;
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <label class="search-field" :class="{ large }">
    <span class="visually-hidden">{{ label }}</span>
    <Search aria-hidden="true" />
    <input v-model="model" class="input focus-ring" type="search" :placeholder="placeholder" />
  </label>
</template>

<style scoped>
.search-field {
  position: relative;
  display: block;
  width: 100%;
  max-width: 34rem;
}

svg {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 0.8rem;
  width: 1.1rem;
  height: 1.1rem;
  transform: translateY(-50%);
  color: var(--text-subtle);
  pointer-events: none;
}

input {
  padding-left: 2.5rem;
}

.large input {
  min-height: 3.25rem;
  font-size: 1.05rem;
}
</style>
