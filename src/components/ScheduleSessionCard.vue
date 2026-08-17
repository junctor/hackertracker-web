<script setup lang="ts">
import { Bookmark, Calendar } from "@lucide/vue";
import { computed } from "vue";

import type { Conference, ScheduledContent } from "../types/hackertracker";

import { useBookmarks } from "../composables/useBookmarks";
import { calendarFileName, generateCalendar } from "../lib/calendar";
import { formatDuration, formatScheduleTime, toIsoDateTime } from "../lib/dates";
import { contentPath } from "../lib/routes";
import SessionCard from "./SessionCard.vue";

const props = defineProps<{
  conference: Conference;
  session: ScheduledContent;
  status?: "Live" | "Next" | null;
}>();

const { bookmarks, toggle } = useBookmarks(() => props.conference.code);
const bookmarked = computed(() => bookmarks.value.has(props.session.contentId));
const beginDateTime = computed(() => toIsoDateTime(props.session.begin));
const endDateTime = computed(() => toIsoDateTime(props.session.end));
const duration = computed(() => formatDuration(props.session.begin, props.session.end));

function downloadCalendar(): void {
  const calendar = generateCalendar(props.session, props.conference);
  if (!calendar) return;
  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = calendarFileName(props.session, props.conference);
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url));
}
</script>

<template>
  <SessionCard
    accent="schedule"
    :accent-color="session.color"
    :title="session.title"
    :to="contentPath(conference.code, session.contentId)"
    :begin="formatScheduleTime(session.begin, session.timeZone, true)"
    :end="session.end ? formatScheduleTime(session.end, session.timeZone) : undefined"
    :duration="duration"
    :begin-date-time="beginDateTime"
    :end-date-time="endDateTime"
    :status="status"
    :people="session.speakers"
    :location="session.location"
    :tags="session.tags"
  >
    <template #actions>
      <button
        type="button"
        class="icon-button focus-ring"
        title="Download iCal event"
        :aria-label="`Download iCal event for ${session.title}`"
        @click="downloadCalendar"
      >
        <Calendar aria-hidden="true" />
      </button>
      <button
        type="button"
        class="icon-button bookmark-button focus-ring"
        :aria-label="`${bookmarked ? 'Remove' : 'Add'} bookmark for ${session.title}`"
        :aria-pressed="bookmarked"
        @click="toggle(session.contentId)"
      >
        <Bookmark aria-hidden="true" :fill="bookmarked ? 'currentColor' : 'none'" />
      </button>
    </template>
  </SessionCard>
</template>
