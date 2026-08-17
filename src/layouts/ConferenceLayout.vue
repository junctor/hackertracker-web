<script setup lang="ts">
import { provide, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import ConferenceHeader from "../components/ConferenceHeader.vue";
import PageState from "../components/PageState.vue";
import SiteFooter from "../components/SiteFooter.vue";
import { conferenceContextKey } from "../composables/useConferenceContext";
import { useConferenceMenu } from "../composables/useConferenceMenu";
import { getConference } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { normalizeConferenceCode } from "../lib/routes";
import type { Conference } from "../types/hackertracker";

const route = useRoute();
const conference = ref<Conference | null>(null);
const loading = ref(true);
const error = ref("");
let request = 0;

const {
  menus,
  menu,
  items: menuItems,
  isLoading: menuLoading,
  error: menuError,
} = useConferenceMenu(conference);

watch(
  () => normalizeConferenceCode(route.params.confCode),
  async (code) => {
    const current = ++request;
    conference.value = null;
    error.value = "";
    if (!code) {
      error.value = "Conference not found.";
      loading.value = false;
      return;
    }
    loading.value = true;
    try {
      const result = await getConference(code);
      if (current !== request) return;
      if (!result) throw new Error(`No conference named ${code} was found.`);
      conference.value = result;
    } catch (reason) {
      if (current === request) error.value = friendlyLoadError(reason, "this conference");
    } finally {
      if (current === request) loading.value = false;
    }
  },
  { immediate: true },
);

watchEffect(() => {
  if (conference.value)
    document.documentElement.dataset.conference = conference.value.code.toLowerCase();
  else delete document.documentElement.dataset.conference;
});

provide(conferenceContextKey, {
  conference,
  menus,
  menu,
  menuItems,
  loading,
  menuLoading,
  error,
  menuError,
});
</script>

<template>
  <div class="conference-shell">
    <ConferenceHeader v-if="conference" :conference="conference" :items="menuItems" />
    <main id="main" class="conference-main">
      <PageState v-if="loading" kind="loading" message="Getting conference details…" />
      <PageState
        v-else-if="error || !conference"
        kind="error"
        title="Conference not found"
        :message="error || 'This conference is not available.'"
      >
        <RouterLink class="button focus-ring" to="/conferences">Browse conferences</RouterLink>
      </PageState>
      <RouterView v-else />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.conference-shell {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
}

.conference-main {
  min-width: 0;
  flex: 1 1 auto;
}
</style>
