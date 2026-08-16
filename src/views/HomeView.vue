<script setup lang="ts">
import { onMounted, ref } from "vue";

import type { Conference } from "../types/hackertracker";

import ConferenceCard from "../components/ConferenceCard.vue";
import SiteFooter from "../components/SiteFooter.vue";
import SiteHeader from "../components/SiteHeader.vue";
import { getUpcomingConferences } from "../firebase/data";

const conferences = ref<Conference[]>([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  document.title = "Hacker Tracker — Schedules for hackers, by hackers";
  try {
    conferences.value = await getUpcomingConferences();
  } catch {
    error.value = "Failed to load conferences.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main id="main" class="home-main">
      <header class="hero">
        <h1 tabindex="-1">Hacker Tracker</h1>
        <p>For hackers, by hackers. All schedules. All talks. All parties.</p>
        <div class="hero-actions">
          <a
            class="store-button store-button--apple focus-ring"
            href="https://apps.apple.com/us/app/hackertracker/id1021141595?mt=8"
            target="_blank"
            rel="noopener noreferrer"
            ><span class="store-copy"
              ><strong>Download for iOS</strong><small>Download on the App Store</small></span
            ><span aria-hidden="true">→</span></a
          >
          <a
            class="store-button store-button--play focus-ring"
            href="https://play.google.com/store/apps/details?id=com.shortstack.hackertracker"
            target="_blank"
            rel="noopener noreferrer"
            ><span class="store-copy"
              ><strong>Download for Android</strong><small>Get it on Google Play</small></span
            ><span aria-hidden="true">→</span></a
          >
        </div>
      </header>

      <section
        v-if="loading || error || conferences.length"
        id="upcoming-mini"
        class="container wide home-conferences"
        aria-labelledby="upcoming-title"
      >
        <div class="section-title-row">
          <h2 id="upcoming-title">
            Upcoming Conferences <span v-if="!loading" class="count">{{ conferences.length }}</span>
          </h2>
        </div>
        <div class="divider" />
        <div
          v-if="loading"
          class="conference-grid"
          aria-busy="true"
          aria-label="Loading upcoming conferences"
        >
          <div v-for="index in 4" :key="index" class="card skeleton" />
        </div>
        <div v-else-if="error" class="empty-state" role="alert">{{ error }}</div>
        <div v-else class="conference-grid">
          <ConferenceCard
            v-for="conference in conferences"
            :key="conference.id"
            :conference="conference"
          />
        </div>
        <RouterLink class="view-all text-link focus-ring" to="/conferences"
          >View all conferences</RouterLink
        >
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
