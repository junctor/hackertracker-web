import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import type { Conference, GroupedSchedule } from "../types/hackertracker";

import {
  filterSchedule,
  getCachedConferenceSchedule,
  getConferenceSchedule,
} from "../firebase/data";
import { loadBookmarks } from "../lib/bookmarks";
import { normalizeConferenceCode } from "../lib/routes";

export function useConferenceSchedule(bookmarksOnly = false) {
  const route = useRoute();
  const conference = ref<Conference | null>(null);
  const grouped = ref<GroupedSchedule | null>(null);
  const loading = ref(true);
  const error = ref("");
  let request = 0;

  const code = computed(() => normalizeConferenceCode(route.params.confCode));
  const applyFilter = (schedule: GroupedSchedule, conferenceCode: string) =>
    bookmarksOnly ? filterSchedule(schedule, loadBookmarks(conferenceCode)) : schedule;

  watch(
    code,
    async (conferenceCode) => {
      const current = ++request;
      if (!conferenceCode) {
        error.value = "Missing required URL parameters.";
        loading.value = false;
        return;
      }
      error.value = "";
      const cached = getCachedConferenceSchedule(conferenceCode);
      if (cached) {
        conference.value = cached.conference;
        grouped.value = applyFilter(cached.grouped, conferenceCode);
        loading.value = false;
      } else {
        conference.value = null;
        grouped.value = null;
        loading.value = true;
      }
      try {
        const schedule = await getConferenceSchedule(conferenceCode);
        if (current !== request) return;
        if (!schedule) {
          error.value = "Conference not found.";
          return;
        }
        conference.value = schedule.conference;
        grouped.value = applyFilter(schedule.grouped, conferenceCode);
      } catch (reason) {
        if (current === request)
          error.value = reason instanceof Error ? reason.message : "Failed to load schedule.";
      } finally {
        if (current === request) loading.value = false;
      }
    },
    { immediate: true },
  );

  return { code, conference, grouped, loading, error };
}
