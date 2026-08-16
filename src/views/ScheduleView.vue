<script setup lang="ts">
import { watchEffect } from "vue";

import PageState from "../components/PageState.vue";
import ScheduleList from "../components/ScheduleList.vue";
import { useConferenceSchedule } from "../composables/useConferenceSchedule";

const { conference, grouped, loading, error } = useConferenceSchedule();
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
      message="Loading schedule..."
    />
    <PageState v-else-if="error" kind="error" title="We couldn't load this page" :message="error">
      <div class="state-actions">
        <RouterLink class="button focus-ring" to="/">Return Home</RouterLink
        ><RouterLink class="button focus-ring" to="/support">Contact Support</RouterLink>
      </div>
    </PageState>
    <ScheduleList
      v-else-if="conference && grouped"
      :conference="conference"
      :date-group="grouped"
      page-title="Schedule"
    />
  </div>
</template>
