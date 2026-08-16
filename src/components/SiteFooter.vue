<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div>
        <p class="eyebrow">Hacker Tracker</p>
        <p class="footer-copy">
          Community-built schedules, people, and conference information for Hacker Tracker.
        </p>
      </div>
      <nav class="footer-nav" aria-label="Footer">
        <RouterLink to="/conferences">Conferences</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/support">Support</RouterLink>
        <a
          href="https://github.com/junctor/hackertracker-web"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >
      </nav>
    </div>
  </footer>
</template>
