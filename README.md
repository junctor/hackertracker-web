# Hacker Tracker Web

The browser companion to the Hacker Tracker Android and iOS apps. It provides conference schedules, session details, speakers, and local bookmarks backed by Firebase.

## Stack

- Vue 3 with TypeScript and Vue Router
- Firebase Firestore
- Vite+ / Vite
- Plain CSS

## Development

```sh
vp install
vp dev
```

Validate changes with:

```sh
vp check
vp test
vp run build
```

The production build copies `index.html` to `404.html` so client-side routes continue to work when hosted on GitHub Pages.
