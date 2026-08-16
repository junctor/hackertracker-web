<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

import type { Organization } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getOrganizations } from "../firebase/data";
import { resolveMenuItems, type MenuRouteKey } from "../lib/menuRoutes";
import { conferenceSectionPath, parseNumericParam } from "../lib/routes";

const route = useRoute();
const { conference, menus } = useConferenceContext();
const organizations = ref<Organization[]>([]);
const loading = ref(true);
const error = ref("");
const query = ref("");
const brokenLogos = ref(new Set<number>());
const section = computed(() =>
  String(route.meta.section ?? route.params.section ?? "organizations"),
);
const organizationId = computed(() => parseNumericParam(route.params.organizationId));
const menuEntry = computed(() => {
  if (!conference.value) return undefined;
  return menus.value
    .flatMap((menu) => resolveMenuItems(conference.value!.code, menu.items))
    .find((item) => item.routeKey === (section.value as MenuRouteKey));
});
const title = computed(
  () =>
    menuEntry.value?.titleText ||
    (section.value === "organizations"
      ? "Organizations"
      : section.value.replace(/^./, (letter) => letter.toUpperCase())),
);
const filtered = computed(() => {
  const tagIds = menuEntry.value?.appliedTagIds ?? [];
  const needle = query.value.trim().toLowerCase();
  return organizations.value
    .filter((item) => !tagIds.length || tagIds.some((id) => item.tag_ids?.includes(id)))
    .filter((item) => !needle || `${item.name} ${item.description}`.toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
});
const selected = computed(() =>
  organizationId.value
    ? organizations.value.find((item) => item.id === organizationId.value)
    : null,
);
const logoUrl = (organization: Organization): string | null => {
  const logo = organization.logo;
  if (!logo || typeof logo !== "object" || !("url" in logo)) return null;
  return typeof logo.url === "string" && /^https?:\/\//.test(logo.url) ? logo.url : null;
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const markBroken = (id: number) => (brokenLogos.value = new Set([...brokenLogos.value, id]));

watch(
  conference,
  async (current) => {
    if (!current) return;
    loading.value = true;
    error.value = "";
    try {
      organizations.value = await getOrganizations(current.code);
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : "Failed to load organizations";
    } finally {
      loading.value = false;
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
  <section v-if="conference" class="container page-content directory-page">
    <PageState v-if="loading" kind="loading" :message="`Loading ${title.toLowerCase()}...`" />
    <PageState
      v-else-if="error"
      kind="error"
      :title="`Couldn't load ${title.toLowerCase()}`"
      :message="error"
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
      <div v-if="selected.description" class="detail-body">
        <MarkdownContent :content="selected.description" />
      </div>
      <section v-if="selected.links?.length" class="links-section">
        <h2>Links</h2>
        <ul>
          <li v-for="link in selected.links" :key="link.url">
            <a
              class="text-link focus-ring"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ link.label || link.url }} ↗</a
            >
          </li>
        </ul>
      </section>
    </article>
    <PageState
      v-else-if="organizationId"
      kind="error"
      title="Organization not found"
      :message="`No organization exists for ID ${organizationId}.`"
    />
    <template v-else>
      <header class="page-heading-row">
        <div>
          <p class="kicker">Conference groups</p>
          <h1 tabindex="-1">{{ title }}</h1>
          <p>Browse conference groups and related resources.</p>
        </div>
        <span>{{ filtered.length.toLocaleString() }} results</span>
      </header>
      <label class="search-control"
        ><span class="visually-hidden">Search {{ title }}</span
        ><input
          v-model="query"
          class="input focus-ring"
          type="search"
          :placeholder="`Search ${title}...`"
      /></label>
      <PageState
        v-if="!filtered.length"
        kind="empty"
        :title="`No ${title.toLowerCase()} found`"
        :message="
          query ? `No results match “${query}”.` : `No ${title.toLowerCase()} are listed yet.`
        "
      />
      <ul v-else class="organization-grid">
        <li v-for="organization in filtered" :key="organization.id">
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
    </template>
  </section>
</template>

<style scoped>
.directory-page {
  padding-block: var(--section-space);
}
.page-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}
.page-heading-row > div > p:last-child {
  margin-top: var(--space-2);
  color: var(--text-muted);
}
.page-heading-row > span {
  color: var(--text-subtle);
  font-size: 0.85rem;
}
.kicker {
  color: var(--accent-success);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
h1 {
  margin-top: 0.2rem;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.05;
  text-wrap: balance;
}
.search-control {
  display: block;
  max-width: 34rem;
  margin-top: var(--space-6);
}
.search-control input {
  width: 100%;
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
.organization-card:hover {
  border-color: color-mix(in oklab, var(--accent), transparent 50%);
  background: var(--surface-interactive);
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
.back-link {
  display: inline-flex;
  color: var(--accent-success);
  font-weight: 700;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-top: var(--space-6);
}
.detail-body {
  max-width: 52rem;
  margin-top: var(--space-8);
}
.links-section {
  margin-top: var(--space-8);
}
.links-section ul {
  display: grid;
  list-style: none;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
@media (width < 40rem) {
  .page-heading-row {
    align-items: flex-start;
    flex-direction: column;
  }
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
