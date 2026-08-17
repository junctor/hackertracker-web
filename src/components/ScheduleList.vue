<script setup lang="ts">
import { Bookmark, Calendar, ChevronLeft, ChevronRight } from "@lucide/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
import ScheduleFilters from "./ScheduleFilters.vue";
import SessionCard from "./SessionCard.vue";

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
const tabScroll = ref<HTMLElement | null>(null);
const canScrollEarlier = ref(false);
const canScrollLater = ref(false);
let tabResizeObserver: ResizeObserver | undefined;

const activeDay = computed(
  () => days.value.find(({ day }) => day === selectedDay.value) ?? days.value[0] ?? null,
);

watch(
  days,
  (value) => {
    if (!value.some(({ day }) => day === selectedDay.value))
      selectedDay.value = value[0]?.day ?? "";
    void nextTick(updateTabScrollState);
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

function updateTabScrollState(): void {
  const element = tabScroll.value;
  if (!element) return;
  const maxScroll = element.scrollWidth - element.clientWidth;
  canScrollEarlier.value = element.scrollLeft > 2;
  canScrollLater.value = maxScroll - element.scrollLeft > 2;
}

function scrollTabs(direction: -1 | 1): void {
  const element = tabScroll.value;
  if (!element) return;
  element.scrollBy({ left: direction * element.clientWidth * 0.75, behavior: "smooth" });
}

async function selectDay(day: string, index: number): Promise<void> {
  selectedDay.value = day;
  await nextTick();
  tabButtons.value[index]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  updateTabScrollState();
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

onMounted(() => {
  bookmarks.value = loadBookmarks(props.conference.code);
  tabResizeObserver = new ResizeObserver(updateTabScrollState);
  if (tabScroll.value) tabResizeObserver.observe(tabScroll.value);
  void nextTick(updateTabScrollState);
});
onBeforeUnmount(() => tabResizeObserver?.disconnect());
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
            ><Bookmark aria-hidden="true" /><span>Bookmarks</span></RouterLink
          >
          <RouterLink
            v-else
            class="tool-button focus-ring"
            :to="schedulePath(conference.code)"
            aria-label="Schedule"
            ><Calendar aria-hidden="true" /><span>Schedule</span></RouterLink
          >
        </div>
      </div>
    </div>

    <div class="day-tabs">
      <div class="container wide">
        <div
          class="day-tabs-tray"
          :data-can-scroll-earlier="canScrollEarlier"
          :data-can-scroll-later="canScrollLater"
        >
          <button
            v-show="canScrollEarlier"
            type="button"
            class="tab-scroll-button tab-scroll-button--earlier focus-ring"
            aria-label="Scroll to earlier days"
            @click="scrollTabs(-1)"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div ref="tabScroll" class="day-tabs-scroll" @scroll.passive="updateTabScrollState">
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
                @click="selectDay(item.day, index)"
                @keydown="handleTabKey($event, index)"
              >
                <span>{{ formatDayTab(item.day, conference.timezone || "UTC") }}</span>
                <span class="count">{{ item.scheduledContents.length }}</span>
              </button>
            </div>
          </div>
          <button
            v-show="canScrollLater"
            type="button"
            class="tab-scroll-button tab-scroll-button--later focus-ring"
            aria-label="Scroll to later days"
            @click="scrollTabs(1)"
          >
            <ChevronRight aria-hidden="true" />
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
          <SessionCard
            accent="schedule"
            :accent-color="content.color"
            :title="content.title"
            :to="contentPath(conference.code, content.contentId)"
            :begin="formatScheduleTime(content.begin, content.timeZone, true)"
            :end="content.end ? formatScheduleTime(content.end, content.timeZone) : undefined"
            :begin-date-time="new Date(content.begin).toISOString()"
            :end-date-time="content.end ? new Date(content.end).toISOString() : undefined"
            :status="status(content)"
            :people="content.speakers"
            :location="content.location"
            :tags="content.tags"
          >
            <template #actions>
              <button
                type="button"
                class="icon-button bookmark-button focus-ring"
                :aria-label="`${bookmarks.has(content.contentId) ? 'Remove' : 'Add'} bookmark for ${content.title}`"
                :aria-pressed="bookmarks.has(content.contentId)"
                @click="bookmark(content.contentId)"
              >
                <Bookmark
                  aria-hidden="true"
                  :fill="bookmarks.has(content.contentId) ? 'currentColor' : 'none'"
                />
              </button>
            </template>
          </SessionCard>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.schedule-tools {
  position: sticky;
  z-index: 40;
  top: 4rem;
  border-bottom: 1px solid var(--border);
  background: var(--color-bg);
}

.schedule-tools-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: 0.625rem;
}

.schedule-tools h1 {
  overflow: hidden;
  font-size: 1.2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.day-tabs {
  position: sticky;
  z-index: 30;
  top: calc(4rem + 3.8rem);
  border-bottom: 1px solid var(--border);
  background: var(--color-bg);
  padding-block: 0.5rem;
}

.day-tabs-tray {
  position: relative;
}

.day-tabs-scroll {
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.day-tabs-scroll::-webkit-scrollbar {
  display: none;
}

.day-tabs-scroll > div {
  display: flex;
  width: max-content;
  min-width: 100%;
  justify-content: center;
  gap: var(--space-2);
}

.day-tabs-tray[data-can-scroll-earlier="true"] .day-tabs-scroll {
  padding-left: calc(var(--control-min) + var(--space-1));
  scroll-padding-left: calc(var(--control-min) + var(--space-3));
}

.day-tabs-tray[data-can-scroll-later="true"] .day-tabs-scroll {
  padding-right: calc(var(--control-min) + var(--space-1));
  scroll-padding-right: calc(var(--control-min) + var(--space-3));
}

.tab-scroll-button {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  display: grid;
  width: var(--control-min);
  place-items: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-2);
  background: var(--surface-elevated);
  color: var(--text-muted);
  box-shadow: var(--shadow-sm);
}

.tab-scroll-button:hover {
  color: var(--text-primary);
}

.tab-scroll-button svg {
  width: 1.2rem;
  height: 1.2rem;
}

.tab-scroll-button--earlier {
  left: 0;
}

.tab-scroll-button--later {
  right: 0;
}

.day-tab {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-2);
  padding: 0.45rem 0.85rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 650;
  white-space: nowrap;
}

.day-tab:hover {
  border-color: var(--border);
  background: var(--surface-muted);
  color: var(--text-primary);
}

.day-tab.active {
  border-color: color-mix(in oklab, var(--accent), transparent 55%);
  background: var(--surface);
  color: white;
}

.day-tab .count {
  color: inherit;
  font-size: 0.75rem;
  opacity: 0.7;
}

.schedule-panel {
  padding-block: 1.25rem 2.5rem;
}

.schedule-day-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
  padding: 0 0.25rem 0.85rem;
}

.schedule-day-heading h2 {
  font-size: clamp(1.25rem, 4vw, 1.55rem);
}

.schedule-day-heading p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.stack-list {
  list-style: none;
}

.stack-list {
  display: grid;
  gap: var(--space-3);
}

.empty-state .button {
  margin-top: var(--space-3);
}

@media (width < 40rem) {
  .schedule-tools h1 {
    font-size: 1rem;
  }

  .day-tabs-scroll > div {
    justify-content: flex-start;
  }

  .schedule-day-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
