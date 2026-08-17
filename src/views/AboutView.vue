<script setup lang="ts">
import { onMounted } from "vue";

import SitePageLayout from "../components/SitePageLayout.vue";

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
  <SitePageLayout static-page>
    <section class="static-hero">
      <div class="container">
        <div class="about-title">
          <img src="/images/logos/ht-logo.png" alt="" />
          <div>
            <h1 tabindex="-1">About Hacker Tracker</h1>
            <p>Conference information, without the scavenger hunt.</p>
          </div>
        </div>
        <p class="lead">
          Hacker Tracker puts schedules, sessions, maps, and conference updates in one place, so
          attendees can spend less time hunting for information and more time participating.
        </p>
      </div>
    </section>
    <div class="container static-content">
      <section>
        <div class="section-title-row">
          <h2>Who uses Hacker Tracker?</h2>
          <span class="count">Community-driven</span>
        </div>
        <p class="lead conference-list">
          Conference teams around the world use Hacker Tracker, including DEF CON, NolaCon, HackGDL,
          Disobey, CactusCon, H2HC, BugCon, Ekoparty, Hack Red Con, SaintCon, MOCA, VCF Midwest,
          many BSides conferences, and others.
        </p>
      </section>
      <section>
        <h2>Who we are</h2>
        <p class="lead">
          We’re a small group of friends who met at DEF CON and wanted conference information to be
          easier for every attendee to find and use.
        </p>
        <div class="team-grid">
          <a
            v-for="member in team"
            :key="member.handle"
            :href="member.url"
            target="_blank"
            rel="noopener noreferrer"
            ><img :src="member.avatar" :alt="`${member.handle} avatar`" /><span
              ><strong>{{ member.handle }}</strong
              ><small>{{ member.role }}</small></span
            ></a
          >
        </div>
      </section>
      <section>
        <h2>Thanks</h2>
        <p class="lead">
          Hacker Tracker exists thanks to people and communities who shared ideas, access, and early
          support.
        </p>
        <ul class="credit-list">
          <li>
            <a href="https://defcon.org" target="_blank" rel="noopener noreferrer">DEF CON</a>
            <small>Where the team met and the project found a home</small>
          </li>
          <li>
            <a href="https://www.ccc.de/en/" target="_blank" rel="noopener noreferrer"
              >Chaos Computer Club (CCC)</a
            ><small>For the inspiration</small>
          </li>
          <li>
            <a href="https://infosec.exchange/@shortstack" target="_blank" rel="noopener noreferrer"
              >ShortStack</a
            ><small>Creator of the original Android release in 2012</small>
          </li>
        </ul>
      </section>
    </div>
  </SitePageLayout>
</template>

<style scoped>
.about-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.about-title img {
  width: 3.5rem;
  height: 3.5rem;
  image-rendering: pixelated;
}

.about-title p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.conference-list {
  max-width: 60rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 var(--space-6);
  margin-top: 1rem;
}

.team-grid > a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--border);
  padding: var(--space-3) 0;
}

.team-grid img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-1);
}

.team-grid span {
  display: grid;
}

.team-grid small,
.credit-list small {
  color: var(--text-muted);
}

.credit-list {
  display: grid;
  gap: var(--space-2);
  margin: 1rem 0 0 1.25rem;
  padding-left: 0.75rem;
  color: #cbd5e1;
}

.credit-list li {
  padding-left: var(--space-2);
}

.credit-list small {
  display: block;
}

@media (width < 56.25rem) {
  .team-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width < 40rem) {
  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>
