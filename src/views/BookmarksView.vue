<script setup lang="ts">
import { watchEffect } from "vue";

import PageState from "../components/PageState.vue";
import ScheduleList from "../components/ScheduleList.vue";
import { useConferenceSchedule } from "../composables/useConferenceSchedule";
import { schedulePath } from "../lib/routes";

const { code, conference, grouped, loading, error } = useConferenceSchedule(true);
watchEffect(() => {
  document.title = error.value
    ? "Error · Bookmarks | Hacker Tracker"
    : conference.value
      ? `Bookmarks · ${conference.value.name} | Hacker Tracker`
      : "Loading bookmarks… | Hacker Tracker";
});
</script>

<template>
  <div>
    <PageState
      v-if="loading && !conference && !grouped"
      kind="loading"
      message="Loading bookmarks..."
    />
    <PageState v-else-if="error" kind="error" title="We couldn't load this page" :message="error" />
    <ScheduleList
      v-else-if="conference && grouped && Object.keys(grouped).length"
      :conference="conference"
      :date-group="grouped"
      page-title="Bookmarks"
    />
    <PageState v-else kind="empty" message="No bookmarks found.">
      <RouterLink v-if="code" class="button focus-ring" :to="schedulePath(code)"
        >Browse Schedule</RouterLink
      >
    </PageState>
  </div>
</template>
