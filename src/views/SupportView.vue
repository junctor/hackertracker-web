<script setup lang="ts">
import { onMounted } from "vue";

import SitePageLayout from "../components/SitePageLayout.vue";

const benefits = [
  "Free for most conferences; large events may reimburse operating costs",
  "We may request one or two event passes",
  "Sponsor recognition where applicable",
  "No collection or sale of attendee data",
  "JSON exports for your website",
  "Pretalx, Sessionize, and Sched integrations",
];
const repositories = [
  { name: "Hacker Tracker (Android)", href: "https://github.com/junctor/android" },
  { name: "Hacker Tracker (iOS)", href: "https://github.com/junctor/hackertracker-ios" },
  { name: "Hacker Tracker (Web)", href: "https://github.com/junctor/hackertracker-web" },
  { name: "Merch Staff App (Android)", note: "Source not yet available" },
  { name: "ConfMgr (Web)", note: "Source not yet available" },
];
onMounted(() => (document.title = "Support · Hacker Tracker"));
</script>

<template>
  <SitePageLayout static-page>
    <section class="static-hero">
      <div class="container">
        <h1 tabindex="-1">Support and contributing</h1>
        <p class="lead">Use Hacker Tracker at your event or help improve the project.</p>
        <div class="quick-links">
          <a
            class="button focus-ring"
            href="https://discord.gg/jJNSZYdnF7"
            target="_blank"
            rel="noopener noreferrer"
            >Join Discord</a
          ><a
            class="button focus-ring"
            href="https://github.com/junctor"
            target="_blank"
            rel="noopener noreferrer"
            >GitHub</a
          ><a
            class="button focus-ring"
            href="https://defcon.social/@aNullValue"
            target="_blank"
            rel="noopener noreferrer"
            >Contact @aNullValue</a
          >
        </div>
      </div>
    </section>
    <div class="container static-content">
      <section>
        <h2>Use Hacker Tracker at your conference</h2>
        <p class="lead">
          Want your conference in Hacker Tracker? Contact
          <a href="https://defcon.social/@aNullValue" target="_blank" rel="noopener noreferrer"
            >@aNullValue</a
          >.
        </p>
        <ul class="info-grid">
          <li v-for="item in benefits" :key="item" class="info-item">
            <span class="dot" />{{ item }}
          </li>
        </ul>
      </section>
      <section>
        <h2>Source code</h2>
        <p class="lead">The project spans several apps:</p>
        <div class="info-grid">
          <div v-for="repository in repositories" :key="repository.name" class="info-item">
            <span
              ><a
                v-if="repository.href"
                :href="repository.href"
                target="_blank"
                rel="noopener noreferrer"
                >{{ repository.name }}</a
              ><strong v-else>{{ repository.name }}</strong
              ><small v-if="repository.note">{{ repository.note }}</small></span
            >
          </div>
        </div>
      </section>
      <section>
        <h2>Issues and contributions</h2>
        <div class="info-grid">
          <article class="info-card">
            <h3>Security</h3>
            <p>
              Found a vulnerability? Use GitHub’s <em>Report a vulnerability</em> in the appropriate
              repo.
            </p>
          </article>
          <article class="info-card">
            <h3>Bugs and features</h3>
            <p>
              Open an issue in the relevant repo. If it spans multiple repos, one report is enough.
            </p>
          </article>
          <article class="info-card wide-card">
            <h3>Contributing</h3>
            <p>Want to contribute? Join Discord and tell us what you’d like to work on.</p>
            <a
              class="button focus-ring"
              href="https://discord.gg/jJNSZYdnF7"
              target="_blank"
              rel="noopener noreferrer"
              >Join our Discord</a
            >
          </article>
        </div>
      </section>
    </div>
  </SitePageLayout>
</template>

<style scoped>
.quick-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--space-6);
  margin-top: 1rem;
}

.info-item,
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  border-top: 1px solid var(--border);
  padding: 0.75rem 0;
  color: #cbd5e1;
}

.info-card {
  display: block;
}

.info-card p {
  margin-top: 0.3rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.info-card .button {
  margin-top: 0.8rem;
}

.wide-card {
  grid-column: 1 / -1;
}

.dot {
  width: 0.4rem;
  height: 0.4rem;
  flex: 0 0 0.4rem;
  margin-top: 0.55rem;
  border-radius: 50%;
  background: var(--text-subtle);
}

.info-item small {
  display: block;
  margin-top: 0.2rem;
  color: var(--text-muted);
}

@media (width < 40rem) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
