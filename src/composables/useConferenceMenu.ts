import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";

import type { Conference, ConferenceMenu } from "../types/hackertracker";

import { getConferenceMenus } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { resolveMenuItem, resolveMenuItems } from "../lib/menuRoutes";

export function useConferenceMenu(conference: MaybeRefOrGetter<Conference | null>) {
  const menus = ref<ConferenceMenu[]>([]);
  const isLoading = ref(false);
  const error = ref("");
  let request = 0;

  watch(
    () => toValue(conference),
    async (currentConference) => {
      const current = ++request;
      menus.value = [];
      error.value = "";
      if (!currentConference) return;
      isLoading.value = true;
      try {
        const result = await getConferenceMenus(currentConference.code);
        if (current === request) menus.value = result;
      } catch (reason) {
        if (current === request) error.value = friendlyLoadError(reason, "the Conference Menu");
      } finally {
        if (current === request) isLoading.value = false;
      }
    },
    { immediate: true },
  );

  const menu = computed(() => {
    const currentConference = toValue(conference);
    return currentConference
      ? (menus.value.find((item) => item.id === currentConference.home_menu_id) ?? null)
      : null;
  });
  const items = computed(() => {
    const currentConference = toValue(conference);
    if (!currentConference || !menu.value) return [];
    return menu.value.items.flatMap((item) => {
      if (item.function !== "menu" || item.menuId === null) {
        const resolved = resolveMenuItem(currentConference.code, item);
        return resolved ? [resolved] : [];
      }
      const nested = menus.value.find((candidate) => candidate.id === item.menuId);
      const nestedItems = nested ? resolveMenuItems(currentConference.code, nested.items) : [];
      const isOrganizationMenu =
        nestedItems.length > 0 &&
        nestedItems.every((candidate) => candidate.function === "organizations");
      if (isOrganizationMenu) return nestedItems;
      const resolved = resolveMenuItem(currentConference.code, item);
      return resolved ? [resolved] : [];
    });
  });

  return { menus, menu, items, isLoading, error };
}
