<script setup lang="ts">
import { computed, ref } from "vue";

import type { TagGroup } from "../types/hackertracker";

import AppIcon from "./AppIcon.vue";

const props = defineProps<{ groups: TagGroup[]; selectedIds: number[] }>();
const emit = defineEmits<{ change: [ids: number[]] }>();
const query = ref("");
const selected = computed(() => new Set(props.selectedIds));
const visibleGroups = computed(() => {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return props.groups;
  return props.groups
    .map((group) => ({
      ...group,
      tags: group.tags.filter(
        (tag) =>
          selected.value.has(tag.id) ||
          group.label.toLowerCase().includes(needle) ||
          tag.label.toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.tags.length);
});

function toggle(id: number, checked: boolean): void {
  const next = new Set(props.selectedIds);
  if (checked) next.add(id);
  else next.delete(id);
  emit(
    "change",
    [...next].sort((a, b) => a - b),
  );
}
</script>

<template>
  <details class="schedule-filter">
    <summary class="tool-button focus-ring">
      <AppIcon name="filter" />
      <span>Filters</span>
      <span v-if="selectedIds.length" class="filter-count">{{ selectedIds.length }}</span>
    </summary>
    <div class="filter-panel">
      <header>
        <div>
          <strong>Schedule filters</strong>
          <p>Tags in one section are matched together.</p>
        </div>
        <button
          v-if="selectedIds.length"
          type="button"
          class="clear-button focus-ring"
          @click="emit('change', [])"
        >
          Clear
        </button>
      </header>
      <label class="filter-search">
        <span class="visually-hidden">Search schedule filters</span>
        <input
          v-model="query"
          class="input focus-ring"
          type="search"
          placeholder="Find a filter..."
        />
      </label>
      <div class="filter-groups">
        <fieldset v-for="group in visibleGroups" :key="group.id">
          <legend>{{ group.label }}</legend>
          <label v-for="tag in group.tags" :key="tag.id" class="filter-option">
            <input
              type="checkbox"
              :checked="selected.has(tag.id)"
              @change="toggle(tag.id, ($event.target as HTMLInputElement).checked)"
            />
            <span>{{ tag.label }}</span>
          </label>
        </fieldset>
      </div>
      <p v-if="!visibleGroups.length" class="no-filters">No filters match “{{ query }}”.</p>
    </div>
  </details>
</template>

<style scoped>
.schedule-filter {
  position: relative;
}
summary {
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
.filter-count {
  display: inline-grid;
  min-width: 1.25rem;
  height: 1.25rem;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-success);
  color: var(--color-bg);
  font-size: 0.7rem;
  font-weight: 800;
}
.filter-panel {
  position: absolute;
  z-index: 45;
  top: calc(100% + 0.75rem);
  right: 0;
  width: min(30rem, calc(100vw - (var(--layout-gutter) * 2)));
  max-height: min(40rem, calc(100dvh - 9rem));
  overflow: auto;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-3);
  background: var(--color-bg);
  padding: var(--space-4);
  box-shadow: var(--shadow-lg);
}
.filter-panel header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}
.filter-panel header p {
  margin-top: 0.15rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}
.clear-button {
  border-radius: var(--radius-1);
  padding: 0.3rem 0.45rem;
  color: var(--accent-success);
  font-size: 0.8rem;
  font-weight: 700;
}
.filter-search {
  display: block;
  margin-top: var(--space-4);
}
.filter-search input {
  width: 100%;
}
.filter-groups {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-5);
}
fieldset {
  min-width: 0;
  border: 0;
  padding: 0;
}
legend {
  margin-bottom: var(--space-2);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}
.filter-option {
  display: flex;
  min-height: 2.25rem;
  align-items: center;
  gap: var(--space-3);
  border-top: 1px solid var(--border);
  padding-block: 0.4rem;
  font-size: 0.9rem;
}
.filter-option input {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  accent-color: var(--accent-success);
}
.no-filters {
  margin-top: var(--space-5);
  color: var(--text-muted);
}
@media (width < 40rem) {
  .filter-panel {
    position: fixed;
    top: 4.5rem;
    right: var(--layout-gutter);
    left: var(--layout-gutter);
    width: auto;
  }
}
</style>
