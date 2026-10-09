import { computed, ref, shallowRef, watch } from "vue";

import type { GroupedSchedule } from "../types/hackertracker";

import { useConferenceContext } from "./useConferenceContext";
import { useBookmarks } from "./useBookmarks";
import {
  filterSchedule,
  getCachedConferenceSchedule,
  getConferenceSchedule,
} from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";

export function useConferenceSchedule(bookmarksOnly = false) {
  const { conference } = useConferenceContext();
  const schedule = shallowRef<GroupedSchedule | null>(null);
  const loading = ref(true);
  const error = ref("");
  let request = 0;

  const code = computed(() => conference.value?.code);
  const { bookmarks } = useBookmarks(() => code.value ?? "");
  const grouped = computed(() => {
    if (!schedule.value) return null;
    return bookmarksOnly ? filterSchedule(schedule.value, bookmarks.value) : schedule.value;
  });

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
        schedule.value = cached.grouped;
        loading.value = false;
      } else {
        schedule.value = null;
        loading.value = true;
      }
      try {
        const loadedSchedule = await getConferenceSchedule(conferenceCode);
        if (current !== request) return;
        if (!loadedSchedule) {
          error.value = "Conference not found.";
          return;
        }
        schedule.value = loadedSchedule.grouped;
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
