<script setup lang="ts">
import { computed } from "vue";

import type { Conference, Content, TagGroup } from "../types/hackertracker";

import { contentPath } from "../lib/routes";
import { getDisplayTags } from "../lib/schedule";
import SessionCard from "./SessionCard.vue";

const props = defineProps<{
  conference: Conference;
  content: Content;
  tags: TagGroup[];
}>();
const allDisplayTags = computed(() => getDisplayTags(props.content, props.tags));
const accent = computed(() => allDisplayTags.value[0]?.color_background || "var(--brand-cyan)");
</script>

<template>
  <SessionCard
    accent="content"
    :accent-color="accent"
    :title="content.title"
    :to="contentPath(conference.code, content.id)"
    :tags="allDisplayTags"
  />
</template>
