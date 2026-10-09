<script setup lang="ts">
import { shallowRef, watch, watchEffect } from "vue";

import type { TagGroup } from "../types/hackertracker";

import PageState from "../components/PageState.vue";
import ScheduleList from "../components/ScheduleList.vue";
import { useConferenceSchedule } from "../composables/useConferenceSchedule";
import { getTags } from "../firebase/data";

const { conference, grouped, loading, error } = useConferenceSchedule();
const tagGroups = shallowRef<TagGroup[]>([]);
let tagRequest = 0;
watch(
  conference,
  async (current) => {
    const currentRequest = ++tagRequest;
    if (!current) {
      tagGroups.value = [];
      return;
    }
    const loadedTags = await getTags(current.code).catch(() => []);
    if (currentRequest === tagRequest) tagGroups.value = loadedTags;
  },
  { immediate: true },
);
watchEffect(() => {
  document.title = error.value
    ? "Schedule unavailable · Hacker Tracker"
    : conference.value
      ? `Schedule · ${conference.value.name} | Hacker Tracker`
      : "Loading schedule… | Hacker Tracker";
});
</script>

<template>
  <div>
    <PageState v-if="loading && !grouped" kind="loading" message="Getting the latest schedule…" />
    <PageState
      v-else-if="error && !grouped"
      kind="error"
      title="Schedule unavailable"
      :message="error"
      retry
    >
      <div class="state-actions">
        <RouterLink class="button focus-ring" to="/">Return home</RouterLink
        ><RouterLink class="button focus-ring" to="/support">Contact support</RouterLink>
      </div>
    </PageState>
    <ScheduleList
      v-else-if="conference && grouped"
      :conference="conference"
      :date-group="grouped"
      :tag-groups="tagGroups"
      page-title="Schedule"
    />
  </div>
</template>
