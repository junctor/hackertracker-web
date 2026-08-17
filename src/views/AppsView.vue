<script setup lang="ts">
import { onMounted } from "vue";

import SitePageLayout from "../components/SitePageLayout.vue";

onMounted(() => (document.title = "Hacker Tracker Apps"));
</script>

<template>
  <SitePageLayout main-class="apps-main">
    <section aria-labelledby="apps-title">
      <h1 id="apps-title" tabindex="-1">Hacker Tracker</h1>
      <p class="intro">Schedules for hackers, by hackers.</p>
      <nav class="actions" aria-label="Hacker Tracker app links">
        <a
          class="action ios focus-ring"
          href="https://apps.apple.com/us/app/hackertracker/id1021141595?mt=8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="action-text">
            <span class="action-label">Download for iOS</span>
            <span class="action-detail">Download on the App Store</span>
          </span>
          <span aria-hidden="true">→</span>
        </a>
        <a
          class="action android focus-ring"
          href="https://play.google.com/store/apps/details?id=com.shortstack.hackertracker"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="action-text">
            <span class="action-label">Download for Android</span>
            <span class="action-detail">Get it on Google Play</span>
          </span>
          <span aria-hidden="true">→</span>
        </a>
        <RouterLink class="action web focus-ring" to="/conferences">
          <span class="action-text">
            <span class="action-label">Open Web Schedule</span>
            <span class="action-detail">Browse conferences in your browser</span>
          </span>
          <span aria-hidden="true">→</span>
        </RouterLink>
      </nav>
    </section>
  </SitePageLayout>
</template>

<style scoped>
:deep(.apps-main) {
  display: grid;
  width: min(100%, 36rem);
  margin-inline: auto;
  align-items: center;
  padding: var(--space-8) var(--page-padding);
}

h1 {
  max-width: 8ch;
  color: white;
  font-size: clamp(3rem, 16vw, 5.25rem);
  line-height: 0.95;
  overflow-wrap: anywhere;
  text-shadow:
    0.045em 0.045em 0 var(--brand-cyan),
    -0.045em -0.045em 0 var(--brand-red);
}

.intro {
  margin-top: var(--space-4);
  color: var(--text-muted);
  font-size: 1.08rem;
}

.actions {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.action {
  display: grid;
  min-height: 4.4rem;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  border-radius: var(--radius-2);
  padding: 0.95rem 1rem 1rem;
  color: #071006;
  font-size: 1.05rem;
  font-weight: 800;
  transition: filter 180ms ease;
}

.ios {
  background: #5eb6ff;
  color: #06111b;
}

.android {
  background: #a6ff4d;
}

.web {
  background: #f6d45a;
  color: #161106;
}

.action-text {
  display: grid;
  min-width: 0;
  gap: 0.18rem;
  line-height: 1.05;
}

.action-label {
  font-size: 1.1rem;
}

.action-detail {
  font-size: 0.86rem;
  line-height: 1.25;
  opacity: 0.74;
}

@media (hover: hover) {
  .action:hover {
    filter: brightness(1.04);
  }
}
</style>
