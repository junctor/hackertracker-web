<script setup lang="ts">
import { onMounted } from "vue";

import SiteFooter from "../components/SiteFooter.vue";
import SiteHeader from "../components/SiteHeader.vue";

const benefits = [
  "No charge for most conferences (large ones may reimburse operational expenses)",
  "We may request an admission ticket or two",
  "In-kind sponsor recognition (if your event has sponsors)",
  "We never collect or sell user data",
  "JSON exports available for your site",
  "Integrations: Pretalx, Sessionize, Sched",
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
  <div class="page-shell">
    <SiteHeader />
    <main id="main" class="main-grow static-page">
      <section class="static-hero">
        <div class="container">
          <h1 tabindex="-1">Support &amp; Contributing</h1>
          <p class="lead">
            Conferences, contributors, and curious folks — here’s how to work with Hacker Tracker.
          </p>
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
              >GitHub org</a
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
          <h2>How can a conference use Hacker Tracker?</h2>
          <p class="lead">
            If you represent a conference and want to make your information available in Hacker
            Tracker, please reach out to
            <a href="https://defcon.social/@aNullValue" target="_blank" rel="noopener noreferrer"
              >@aNullValue</a
            >.
          </p>
          <ul class="info-grid">
            <li v-for="item in benefits" :key="item" class="card info-item">
              <span class="dot" />{{ item }}
            </li>
          </ul>
        </section>
        <section>
          <h2>Source Code</h2>
          <p class="lead">Our project is made up of several apps maintained separately:</p>
          <div class="info-grid">
            <div v-for="repository in repositories" :key="repository.name" class="card info-item">
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
          <h2>Bug Reports &amp; Contributions</h2>
          <div class="info-grid">
            <article class="card info-card">
              <h3>Security</h3>
              <p>
                Found a vulnerability? Use GitHub’s <em>Report a vulnerability</em> in the
                appropriate repo.
              </p>
            </article>
            <article class="card info-card">
              <h3>Bugs &amp; Features</h3>
              <p>
                Open an issue in the relevant repo. If it spans multiple repos, one report is
                enough.
              </p>
            </article>
            <article class="card info-card wide-card">
              <h3>Contributing</h3>
              <p>
                Interested in contributing? Reach out to any of us. We don’t yet have a formal
                onboarding process, but we’d love to collaborate.
              </p>
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
    </main>
    <SiteFooter />
  </div>
</template>
