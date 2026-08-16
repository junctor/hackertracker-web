<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  Conference,
  GroupedSchedule,
  ScheduledContent,
  TagGroup,
} from "../types/hackertracker";

import { loadBookmarks, toggleBookmark } from "../lib/bookmarks";
import { formatScheduleTime } from "../lib/dates";
import { bookmarksPath, contentPath, schedulePath } from "../lib/routes";
import { formatDayHeading, formatDayTab } from "../lib/schedule";
import AppIcon from "./AppIcon.vue";
import ScheduleFilters from "./ScheduleFilters.vue";

const props = defineProps<{
  dateGroup: GroupedSchedule;
  conference: Conference;
  pageTitle: string;
  tagGroups?: TagGroup[];
}>();
const route = useRoute();
const router = useRouter();
const allScheduledContent = computed(() => Object.values(props.dateGroup).flat());
const availableTagGroups = computed(() => {
  const used = new Set(allScheduledContent.value.flatMap((item) => item.tags.map((tag) => tag.id)));
  return (props.tagGroups ?? [])
    .filter((group) => group.is_browsable)
    .map((group) => ({ ...group, tags: group.tags.filter((tag) => used.has(tag.id)) }))
    .filter((group) => group.tags.length);
});
const selectedTagIds = computed(() => {
  const values = route.query.tag_group;
  const groups = Array.isArray(values) ? values : values ? [values] : [];
  return Array.from(
    new Set(
      groups.flatMap((group) =>
        typeof group === "string"
          ? group
              .split(",")
              .filter((value) => /^\d+$/.test(value))
              .map(Number)
          : [],
      ),
    ),
  );
});
const selectedGroups = computed(() => {
  const selected = new Set(selectedTagIds.value);
  return availableTagGroups.value
    .map((group) => group.tags.filter((tag) => selected.has(tag.id)).map((tag) => tag.id))
    .filter((group) => group.length);
});
const filteredDateGroup = computed<GroupedSchedule>(() => {
  if (!selectedGroups.value.length) return props.dateGroup;
  return Object.fromEntries(
    Object.entries(props.dateGroup)
      .map(([day, items]) => [
        day,
        items.filter((item) => {
          const tags = new Set(item.tags.map((tag) => tag.id));
          return selectedGroups.value.every((group) => group.some((tagId) => tags.has(tagId)));
        }),
      ])
      .filter(([, items]) => items.length),
  );
});
const days = computed(() =>
  Object.entries(filteredDateGroup.value).map(([day, scheduledContents]) => ({
    day,
    scheduledContents,
  })),
);
const selectedDay = ref("");
const bookmarks = ref(new Set<number>());
const nowSeconds = Math.floor(Date.now() / 1000);
const tabButtons = ref<HTMLButtonElement[]>([]);

const activeDay = computed(
  () => days.value.find(({ day }) => day === selectedDay.value) ?? days.value[0] ?? null,
);

watch(
  days,
  (value) => {
    if (!value.some(({ day }) => day === selectedDay.value))
      selectedDay.value = value[0]?.day ?? "";
  },
  { immediate: true },
);

watch(
  () => props.conference.code,
  (code) => (bookmarks.value = loadBookmarks(code)),
  { immediate: true },
);

function bookmark(id: number): void {
  bookmarks.value = toggleBookmark(props.conference.code, id);
}

function updateFilters(ids: number[]): void {
  const selected = new Set(ids);
  const groups = availableTagGroups.value
    .map((group) => group.tags.filter((tag) => selected.has(tag.id)).map((tag) => tag.id))
    .filter((group) => group.length)
    .map((group) => group.join(","));
  const query = { ...route.query };
  if (groups.length) query.tag_group = groups;
  else delete query.tag_group;
  void router.replace({ query });
}

function timestamp(content: ScheduledContent, key: "begin" | "end"): number {
  const stored = key === "begin" ? content.beginTimestampSeconds : content.endTimestampSeconds;
  const value = key === "begin" ? content.begin : content.end;
  return (
    stored ?? (value ? Math.floor(new Date(value).getTime() / 1000) : timestamp(content, "begin"))
  );
}

function status(content: ScheduledContent): "Live" | "Next" | null {
  const begin = timestamp(content, "begin");
  const end = timestamp(content, "end");
  if (begin <= nowSeconds && nowSeconds < end) return "Live";
  if (begin > nowSeconds && begin - nowSeconds <= 30 * 60) return "Next";
  return null;
}

async function handleTabKey(event: KeyboardEvent, index: number): Promise<void> {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const last = days.value.length - 1;
  let target = index;
  if (event.key === "ArrowLeft") target = index === 0 ? last : index - 1;
  if (event.key === "ArrowRight") target = index === last ? 0 : index + 1;
  if (event.key === "Home") target = 0;
  if (event.key === "End") target = last;
  selectedDay.value = days.value[target]?.day ?? selectedDay.value;
  await nextTick();
  tabButtons.value[target]?.focus();
  tabButtons.value[target]?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

onMounted(() => (bookmarks.value = loadBookmarks(props.conference.code)));
</script>

<template>
  <div class="schedule-page">
    <div class="schedule-tools">
      <div class="container wide schedule-tools-inner">
        <h1 tabindex="-1">{{ pageTitle }}</h1>
        <div class="schedule-actions">
          <ScheduleFilters
            v-if="pageTitle === 'Schedule' && availableTagGroups.length"
            :groups="availableTagGroups"
            :selected-ids="selectedTagIds"
            @change="updateFilters"
          />
          <RouterLink
            v-if="pageTitle === 'Schedule'"
            class="tool-button focus-ring"
            :to="bookmarksPath(conference.code)"
            aria-label="View bookmarked events"
            ><AppIcon name="bookmark" /><span>Bookmarks</span></RouterLink
          >
          <RouterLink
            v-else
            class="tool-button focus-ring"
            :to="schedulePath(conference.code)"
            aria-label="Schedule"
            ><AppIcon name="calendar" /><span>Schedule</span></RouterLink
          >
        </div>
      </div>
    </div>

    <div class="day-tabs">
      <div class="container wide day-tabs-scroll">
        <div role="tablist" aria-label="Schedule days" aria-orientation="horizontal">
          <button
            v-for="(item, index) in days"
            :id="`day-tab-${item.day}`"
            :key="item.day"
            :ref="
              (element) => {
                if (element) tabButtons[index] = element as HTMLButtonElement;
              }
            "
            type="button"
            role="tab"
            class="day-tab focus-ring"
            :class="{ active: activeDay?.day === item.day }"
            :aria-selected="activeDay?.day === item.day"
            :aria-controls="`day-panel-${item.day}`"
            :tabindex="activeDay?.day === item.day ? 0 : -1"
            @click="selectedDay = item.day"
            @keydown="handleTabKey($event, index)"
          >
            <span>{{ formatDayTab(item.day, conference.timezone || "UTC") }}</span>
            <span class="count">{{ item.scheduledContents.length }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="!days.length" class="container wide page-content">
      <div class="empty-state">
        <p>
          {{
            selectedTagIds.length
              ? "No sessions match the selected filters."
              : "No events are available."
          }}
        </p>
        <button
          v-if="selectedTagIds.length"
          type="button"
          class="button focus-ring"
          @click="updateFilters([])"
        >
          Clear filters
        </button>
      </div>
    </div>
    <section
      v-else-if="activeDay"
      :id="`day-panel-${activeDay.day}`"
      role="tabpanel"
      :aria-labelledby="`day-tab-${activeDay.day}`"
      tabindex="0"
      class="container wide schedule-panel"
    >
      <header class="schedule-day-heading">
        <h2>{{ formatDayHeading(activeDay.day, conference.timezone || "UTC") }}</h2>
        <p>
          {{ activeDay.scheduledContents.length }}
          {{ activeDay.scheduledContents.length === 1 ? "event" : "events" }}
        </p>
      </header>
      <ul class="stack-list schedule-list">
        <li
          v-for="content in activeDay.scheduledContents"
          :key="`${content.contentId}:${content.sessionId}`"
        >
          <article
            class="card interactive accent-card schedule-card"
            :style="{ '--content-color': content.color ?? '#64748b' }"
          >
            <span class="accent-rail" aria-hidden="true" />
            <RouterLink
              class="schedule-card-link focus-ring"
              :to="contentPath(conference.code, content.contentId)"
            >
              <div class="schedule-time">
                <span
                  v-if="status(content)"
                  class="status-pill"
                  :class="`status-pill--${status(content)?.toLowerCase()}`"
                  >{{ status(content) }}</span
                >
                <time :datetime="new Date(content.begin).toISOString()">{{
                  formatScheduleTime(content.begin, content.timeZone, true)
                }}</time>
                <time v-if="content.end" :datetime="new Date(content.end).toISOString()">{{
                  formatScheduleTime(content.end, content.timeZone)
                }}</time>
              </div>
              <div class="schedule-summary">
                <h3>{{ content.title }}</h3>
                <p v-if="content.speakers" class="speakers">{{ content.speakers }}</p>
                <p v-if="content.location">{{ content.location }}</p>
                <ul v-if="content.tags.length" class="tag-list">
                  <li
                    v-for="tag in content.tags.slice(0, 2)"
                    :key="tag.id"
                    class="tag"
                    :style="{
                      backgroundColor: tag.color_background ?? undefined,
                      color: tag.color_foreground ?? undefined,
                    }"
                  >
                    {{ tag.label }}
                  </li>
                  <li v-if="content.tags.length > 2" class="tag tag--more">
                    +{{ content.tags.length - 2 }} more
                  </li>
                </ul>
              </div>
            </RouterLink>
            <button
              type="button"
              class="icon-button bookmark-button focus-ring"
              :aria-label="`${bookmarks.has(content.contentId) ? 'Remove' : 'Add'} bookmark for ${content.title}`"
              :aria-pressed="bookmarks.has(content.contentId)"
              @click="bookmark(content.contentId)"
            >
              <AppIcon name="bookmark" :filled="bookmarks.has(content.contentId)" />
            </button>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.schedule-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.empty-state .button {
  margin-top: var(--space-3);
}
</style>
