<script setup lang="ts">
type IconName =
  | "arrow-left"
  | "bookmark"
  | "calendar"
  | "close"
  | "external"
  | "filter"
  | "github"
  | "home"
  | "info"
  | "menu"
  | "people"
  | "pin"
  | "search"
  | "share"
  | "support";

const props = defineProps<{ name: IconName; filled?: boolean }>();

const paths: Record<IconName, string[]> = {
  "arrow-left": ["M19 12H5m7-7-7 7 7 7"],
  bookmark: ["M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z"],
  calendar: ["M6 2v3m12-3v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"],
  close: ["m6 6 12 12M18 6 6 18"],
  external: ["M14 4h6v6m0-6-9 9", "M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"],
  filter: ["M4 6h16M7 12h10M10 18h4"],
  github: [
    "M12 2.75a9.25 9.25 0 0 0-2.93 18.03c.46.09.63-.2.63-.45v-1.8c-2.57.56-3.11-1.09-3.11-1.09-.42-1.07-1.03-1.35-1.03-1.35-.84-.58.06-.57.06-.57.93.07 1.42.96 1.42.96.83 1.42 2.17 1.01 2.7.77.08-.6.32-1.01.59-1.25-2.05-.23-4.2-1.02-4.2-4.57 0-1.01.36-1.84.95-2.49-.1-.23-.42-1.18.09-2.45 0 0 .78-.25 2.54.95A8.8 8.8 0 0 1 12 7.14a8.8 8.8 0 0 1 2.32.31c1.76-1.2 2.53-.95 2.53-.95.51 1.27.19 2.22.1 2.45.59.65.94 1.48.94 2.49 0 3.56-2.16 4.33-4.22 4.56.33.29.63.85.63 1.71v2.62c0 .25.17.55.64.45A9.25 9.25 0 0 0 12 2.75Z",
  ],
  home: ["m3 11 9-8 9 8", "M5 10v10h14V10M9 20v-6h6v6"],
  info: ["M12 8h.01M11 12h1v5h1", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  people: [
    "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-11.26a4 4 0 0 1 0 7.75",
  ],
  pin: ["M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  search: ["m21 21-4.35-4.35", "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"],
  share: ["M4 12v8h16v-8M12 16V3m0 0L7 8m5-5 5 5"],
  support: [
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    "M4.93 4.93 9.17 9.17m5.66 5.66 4.24 4.24m0-14.14-4.24 4.24m-5.66 5.66-4.24 4.24",
    "M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z",
  ],
};
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    :class="$attrs.class"
    aria-hidden="true"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      v-for="path in paths[props.name]"
      :key="path"
      :d="path"
      :fill="props.filled && props.name === 'bookmark' ? 'currentColor' : 'none'"
    />
  </svg>
</template>
