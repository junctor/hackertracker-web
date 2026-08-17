<template>
  <footer class="site-footer">
    <div class="container wide footer-inner">
      <div>
        <p class="eyebrow"><img src="/images/logos/ht-logo.png" alt="" />Hacker Tracker</p>
        <p class="footer-copy">Community-built conference schedules, talks, and people.</p>
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

<style scoped>
.site-footer {
  margin-top: auto;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding-block: var(--space-5);
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-subtle);
  font-size: 0.7rem;
  font-weight: 700;
}

.eyebrow img {
  width: 1.25rem;
  height: 1.25rem;
  image-rendering: pixelated;
}

.footer-copy {
  margin-top: var(--space-1);
  font-size: 0.875rem;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  font-size: 0.875rem;
}

.footer-nav a:hover {
  color: white;
}

@media (width < 40rem) {
  .footer-inner {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
