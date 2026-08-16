<script setup lang="ts">
import { onMounted, ref } from "vue";

import SiteFooter from "../components/SiteFooter.vue";
import SiteHeader from "../components/SiteHeader.vue";

const messages = [
  "404: This path is off the grid. It either got wiped or never existed.",
  "Dead link detected. The resource you’re probing isn’t here.",
  "Nothing to see here—this route’s a ghost in the machine.",
  "Page not found. Either it’s been moved, or it was just a rumor.",
  "You’ve reached a null sector. No data lives at this address.",
  "Invalid opcode. This page cannot be executed.",
  "Access denied: target not in scope.",
  "Glitch in the system. That page never compiled.",
];
const message = ref(messages[Math.floor(Math.random() * messages.length)] ?? messages[0]);
onMounted(() => (document.title = "Page not found · Hacker Tracker"));
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main id="main" class="main-grow not-found">
      <div>
        <h1 tabindex="-1">404 — Page not found</h1>
        <p>{{ message }}</p>
        <div class="state-actions">
          <RouterLink class="button focus-ring" to="/conferences">Browse Conferences</RouterLink
          ><RouterLink class="button focus-ring" to="/">Home</RouterLink>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
