<script setup lang="ts">
import { onMounted } from "vue";

import SiteFooter from "../components/SiteFooter.vue";
import SiteHeader from "../components/SiteHeader.vue";

const conferences = [
  "DEF CON",
  "NolaCon",
  "HackGDL",
  "Disobey",
  "CactusCon",
  "H2HC",
  "BugCon",
  "Ekoparty",
  "Hack Red Con",
  "SaintCon",
  "MOCA",
  "VCF Midwest",
  "Many BSides conferences",
  "…and others",
];
const team = [
  {
    handle: "advice",
    url: "https://github.com/Advice-Dog",
    role: "Android",
    avatar: "https://github.com/Advice-Dog.png",
  },
  {
    handle: "aNullValue",
    url: "https://github.com/aNullValue",
    role: "Project manager & ConfMgr",
    avatar: "https://github.com/aNullValue.png",
  },
  {
    handle: "cak",
    url: "https://github.com/cak",
    role: "Web",
    avatar: "https://github.com/cak.png",
  },
  {
    handle: "l4wke",
    url: "https://github.com/sethlaw",
    role: "iOS",
    avatar: "https://github.com/sethlaw.png",
  },
];
onMounted(() => (document.title = "About · Hacker Tracker"));
</script>

<template>
  <div class="page-shell">
    <SiteHeader />
    <main id="main" class="main-grow static-page">
      <section class="static-hero">
        <div class="container">
          <div class="about-title">
            <img src="/images/logos/ht-logo.png" alt="" />
            <div>
              <h1 tabindex="-1">About Hacker Tracker</h1>
              <p>Help your conference attendees help themselves.</p>
            </div>
          </div>
          <p class="lead">
            Hacker Tracker is a conference information app used by tech-related conferences of all
            sizes. Our mission is to help attendees help themselves with accurate, up-to-date
            schedules and details.
          </p>
        </div>
      </section>
      <div class="container static-content">
        <section>
          <div class="section-title-row">
            <h2>Who Uses Hacker Tracker?</h2>
            <span class="count">Community-driven</span>
          </div>
          <ul class="info-grid three-columns">
            <li v-for="name in conferences" :key="name" class="info-item">
              <span class="dot" />{{ name }}
            </li>
          </ul>
        </section>
        <section>
          <h2>Who We Are</h2>
          <p class="lead">
            We’re a small group of friends who met at DEF CON and recognized the need for improved
            attendee communication at conferences everywhere.
          </p>
          <ul class="team-grid">
            <li v-for="member in team" :key="member.handle">
              <a :href="member.url" target="_blank" rel="noopener noreferrer"
                ><img :src="member.avatar" :alt="`${member.handle} avatar`" /><span
                  ><strong>{{ member.handle }}</strong
                  ><small>{{ member.role }}</small></span
                ></a
              >
            </li>
          </ul>
        </section>
        <section>
          <h2>Thanks</h2>
          <ul class="info-grid">
            <li class="info-item">
              <a href="https://defcon.org" target="_blank" rel="noopener noreferrer">DEF CON</a>
            </li>
            <li class="info-item">
              <span
                ><a href="https://www.ccc.de/en/" target="_blank" rel="noopener noreferrer"
                  >Chaos Computer Club (CCC)</a
                ><small>Source of inspiration</small></span
              >
            </li>
            <li class="info-item">
              <span
                ><a
                  href="https://infosec.exchange/@shortstack"
                  target="_blank"
                  rel="noopener noreferrer"
                  >ShortStack</a
                ><small>Original Android release (2012)</small></span
              >
            </li>
          </ul>
        </section>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
