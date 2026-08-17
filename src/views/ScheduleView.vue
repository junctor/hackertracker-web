<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";

import type { TagGroup } from "../types/hackertracker";

import PageState from "../components/PageState.vue";
import ScheduleList from "../components/ScheduleList.vue";
import { useConferenceSchedule } from "../composables/useConferenceSchedule";
import { getTags } from "../firebase/data";

const { conference, grouped, loading, error } = useConferenceSchedule();
const tagGroups = ref<TagGroup[]>([]);
watch(
  conference,
  async (current) => {
    tagGroups.value = current ? await getTags(current.code).catch(() => []) : [];
  },
  { immediate: true },
);
watchEffect(() => {
  document.title = error.value
    ? "Error · Schedule | Hacker Tracker"
    : conference.value
      ? `Schedule · ${conference.value.name} | Hacker Tracker`
      : "Loading schedule… | Hacker Tracker";
});
</script>

<template>
  <div>
    <PageState
      v-if="loading && !conference && !grouped"
      kind="loading"
      message="Getting the latest schedule…"
    />
    <PageState v-else-if="error" kind="error" title="Schedule unavailable" :message="error">
      <div class="state-actions">
        <RouterLink class="button focus-ring" to="/">Return Home</RouterLink
        ><RouterLink class="button focus-ring" to="/support">Contact Support</RouterLink>
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
