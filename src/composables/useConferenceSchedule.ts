import { computed, ref, watch } from "vue";

import type { GroupedSchedule } from "../types/hackertracker";

import { useConferenceContext } from "./useConferenceContext";
import {
  filterSchedule,
  getCachedConferenceSchedule,
  getConferenceSchedule,
} from "../firebase/data";
import { loadBookmarks } from "../lib/bookmarks";
import { friendlyLoadError } from "../lib/errors";

export function useConferenceSchedule(bookmarksOnly = false) {
  const { conference } = useConferenceContext();
  const grouped = ref<GroupedSchedule | null>(null);
  const loading = ref(true);
  const error = ref("");
  let request = 0;

  const code = computed(() => conference.value?.code);
  const applyFilter = (schedule: GroupedSchedule, conferenceCode: string) =>
    bookmarksOnly ? filterSchedule(schedule, loadBookmarks(conferenceCode)) : schedule;

  watch(
    code,
    async (conferenceCode) => {
      const current = ++request;
      if (!conferenceCode) {
        error.value = "This link is missing a valid conference.";
        loading.value = false;
        return;
      }
      error.value = "";
      const cached = getCachedConferenceSchedule(conferenceCode);
      if (cached) {
        grouped.value = applyFilter(cached.grouped, conferenceCode);
        loading.value = false;
      } else {
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
        grouped.value = applyFilter(schedule.grouped, conferenceCode);
      } catch (reason) {
        if (current === request) error.value = friendlyLoadError(reason, "the schedule");
      } finally {
        if (current === request) loading.value = false;
      }
    },
    { immediate: true },
  );

  return { code, conference, grouped, loading, error };
}
