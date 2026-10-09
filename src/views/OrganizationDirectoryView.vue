<script setup lang="ts">
import { CalendarSearch } from "@lucide/vue";
import { computed, ref, shallowRef, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Organization } from "../types/hackertracker";

import ExternalLinkList from "../components/ExternalLinkList.vue";
import MarkdownContent from "../components/MarkdownContent.vue";
import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import SearchField from "../components/SearchField.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { useRouteTextQuery } from "../composables/useRouteTextQuery";
import { getOrganizations } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { resolveMenuItems, type MenuRouteKey } from "../lib/menuRoutes";
import { conferenceSectionPath, filteredScheduleRoute, parseNumericParam } from "../lib/routes";
import { compareBySortOrder } from "../lib/sort";
import { safeExternalLinks, safeWebUrl } from "../lib/urls";

const route = useRoute();
const { conference, menus } = useConferenceContext();
const organizations = shallowRef<Organization[]>([]);
const loading = ref(true);
const error = ref("");
let request = 0;
const BATCH_SIZE = 60;
const visibleCount = ref(BATCH_SIZE);
const query = useRouteTextQuery();
const brokenLogos = ref(new Set<number>());
const section = computed(() =>
  String(route.meta.section ?? route.params.section ?? "organizations"),
);
const organizationId = computed(() => parseNumericParam(route.params.organizationId));
const menuEntry = computed(() => {
  const currentConference = conference.value;
  if (!currentConference) return undefined;
  return menus.value
    .flatMap((menu) => resolveMenuItems(currentConference.code, menu.items))
    .find((item) => item.routeKey === (section.value as MenuRouteKey));
});
const title = computed(
  () =>
    menuEntry.value?.titleText ||
    (section.value === "organizations"
      ? "Organizations"
      : section.value.replace(/^./, (letter) => letter.toUpperCase())),
);
const sectionOrganizations = computed(() => {
  const tagIds = menuEntry.value?.appliedTagIds ?? [];
  return organizations.value
    .filter((item) => !tagIds.length || tagIds.some((id) => item.tag_ids?.includes(id)))
    .sort(
      (a, b) =>
        compareBySortOrder(a, b) ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
});
const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return sectionOrganizations.value.filter(
    (item) => !needle || `${item.name} ${item.description}`.toLowerCase().includes(needle),
  );
});
const visibleOrganizations = computed(() => filtered.value.slice(0, visibleCount.value));
const remaining = computed(() =>
  Math.max(0, filtered.value.length - visibleOrganizations.value.length),
);
const selected = computed(() =>
  organizationId.value
    ? organizations.value.find((item) => item.id === organizationId.value)
    : null,
);
const scheduleTagIds = computed(() => {
  const organization = selected.value;
  if (!organization)
    return Array.from(
      new Set(
        sectionOrganizations.value.flatMap((item) =>
          typeof item.tag_id_as_organizer === "number" ? [item.tag_id_as_organizer] : [],
        ),
      ),
    );
  return typeof organization.tag_id_as_organizer === "number"
    ? [organization.tag_id_as_organizer]
    : [];
});
const selectedLinks = computed(() => safeExternalLinks(selected.value?.links ?? []));
const logoUrl = (organization: Organization): string | null => {
  const logo = organization.logo;
  if (!logo || typeof logo !== "object" || !("url" in logo)) return null;
  return safeWebUrl(logo.url);
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const markBroken = (id: number) => (brokenLogos.value = new Set([...brokenLogos.value, id]));
watch([query, organizations, section], () => (visibleCount.value = BATCH_SIZE));

watch(
  conference,
  async (current) => {
    const currentRequest = ++request;
    if (!current) {
      organizations.value = [];
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      const loadedOrganizations = await getOrganizations(current.code);
      if (currentRequest === request) organizations.value = loadedOrganizations;
    } catch (reason) {
      if (currentRequest === request)
        error.value = friendlyLoadError(reason, title.value.toLowerCase());
    } finally {
      if (currentRequest === request) loading.value = false;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (conference.value)
    document.title = `${selected.value?.name || title.value} · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content">
    <PageState v-if="loading" kind="loading" :message="`Getting ${title.toLowerCase()}…`" />
    <PageState
      v-else-if="error"
      kind="error"
      :title="`${title} unavailable`"
      :message="error"
      retry
    />
    <article v-else-if="organizationId && selected" class="organization-detail">
      <RouterLink class="back-link focus-ring" :to="conferenceSectionPath(conference.code, section)"
        >← {{ title }}</RouterLink
      >
      <header class="detail-header">
        <div class="organization-logo large">
          <img
            v-if="logoUrl(selected) && !brokenLogos.has(selected.id)"
            :src="logoUrl(selected)!"
            :alt="`${selected.name} logo`"
            @error="markBroken(selected.id)"
          />
          <span v-else aria-hidden="true">{{ initials(selected.name) }}</span>
        </div>
        <div>
          <p class="kicker">{{ title }}</p>
          <h1 tabindex="-1">{{ selected.name }}</h1>
        </div>
      </header>
      <RouterLink
        v-if="scheduleTagIds.length"
        class="icon-button focus-ring schedule-link detail-schedule-link"
        :to="filteredScheduleRoute(conference.code, { tagIds: scheduleTagIds })"
        aria-label="View events on schedule"
      >
        <CalendarSearch aria-hidden="true" />
      </RouterLink>
      <div v-if="selected.description" class="detail-body">
        <MarkdownContent :content="selected.description" :heading-start="2" />
      </div>
      <section v-if="selectedLinks.length" class="links-section">
        <h2>Links</h2>
        <ExternalLinkList :items="selectedLinks" compact />
      </section>
    </article>
    <PageState
      v-else-if="organizationId"
      kind="error"
      title="Organization not found"
      :message="`No organization exists for ID ${organizationId}.`"
    />
    <template v-else>
      <PageHeading
        :title="title"
        intro="Browse groups and resources."
        :count="`${filtered.length.toLocaleString()} results`"
      >
        <RouterLink
          v-if="scheduleTagIds.length"
          class="icon-button focus-ring schedule-link"
          :to="filteredScheduleRoute(conference.code, { tagIds: scheduleTagIds })"
          aria-label="View on schedule"
        >
          <CalendarSearch aria-hidden="true" />
        </RouterLink>
      </PageHeading>
      <SearchField
        v-model="query"
        class="page-search"
        :label="`Search ${title}`"
        :placeholder="`Search ${title}…`"
      />
      <PageState
        v-if="!filtered.length"
        kind="empty"
        heading-level="h2"
        :title="`No ${title.toLowerCase()} found`"
        :message="
          query ? `No results match “${query}”.` : `No ${title.toLowerCase()} are listed yet.`
        "
      />
      <ul v-else class="organization-grid">
        <li v-for="organization in visibleOrganizations" :key="organization.id">
          <RouterLink
            class="organization-card focus-ring"
            :to="`${conferenceSectionPath(conference.code, section)}/${organization.id}`"
          >
            <span class="organization-logo">
              <img
                v-if="logoUrl(organization) && !brokenLogos.has(organization.id)"
                :src="logoUrl(organization)!"
                :alt="`${organization.name} logo`"
                loading="lazy"
                @error="markBroken(organization.id)"
              />
              <span v-else aria-hidden="true">{{ initials(organization.name) }}</span>
            </span>
            <strong>{{ organization.name }}</strong>
          </RouterLink>
        </li>
      </ul>
      <button
        v-if="remaining"
        type="button"
        class="button organization-load-more focus-ring"
        @click="visibleCount += BATCH_SIZE"
      >
        Show {{ Math.min(BATCH_SIZE, remaining) }} more
      </button>
    </template>
  </section>
</template>

<style scoped>
.kicker {
  color: var(--accent-success);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
h1 {
  margin-top: 0.2rem;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.05;
  text-wrap: balance;
}
.organization-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  list-style: none;
  gap: var(--space-4);
  margin-top: var(--space-6);
}
.organization-card {
  display: flex;
  height: 100%;
  align-items: center;
  gap: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-3);
  background: var(--surface-muted);
  padding: var(--space-4);
}
.organization-grid > li {
  content-visibility: auto;
  contain-intrinsic-size: auto 5rem;
}
.organization-load-more {
  display: flex;
  margin: var(--space-5) auto 0;
}
.organization-card:hover {
  border-color: color-mix(in oklab, var(--accent), transparent 50%);
  background: var(--surface-interactive);
}
.organization-card strong {
  min-width: 0;
  line-height: 1.3;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.organization-logo {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  overflow: hidden;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  background: var(--surface-elevated);
  color: var(--accent-success);
  font-weight: 800;
}
.organization-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.organization-logo.large {
  width: 5rem;
  height: 5rem;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-top: var(--space-6);
}
.detail-header > div:last-child {
  min-width: 0;
}
.detail-header h1 {
  overflow-wrap: anywhere;
  word-break: break-word;
}
.detail-body {
  max-width: 52rem;
  margin-top: var(--space-8);
}
.detail-schedule-link {
  margin-top: var(--space-6);
}
.schedule-link svg {
  width: 1.15rem;
  height: 1.15rem;
}
.links-section {
  margin-top: var(--space-8);
}
.links-section :deep(.link-list) {
  margin-top: var(--space-3);
}
@media (width < 40rem) {
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
