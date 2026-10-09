# Hacker Tracker Web

[![Deploy HT Web](https://github.com/junctor/hackertracker-web/actions/workflows/pages.yml/badge.svg)](https://github.com/junctor/hackertracker-web/actions/workflows/pages.yml)
[![Live site](https://img.shields.io/badge/live-hackertracker.app-00e5e5)](https://hackertracker.app)

The fast, installable web client for [Hacker Tracker](https://hackertracker.app). Browse conference schedules, talks, speakers, maps, announcements, merchandise, feedback forms, and community resources from any modern browser—including previously visited schedules when the network is unavailable.

Built with Vue, TypeScript, Vite+, and Firebase.

## Highlights

- Conference schedules organized by day, location, and tag
- Full-conference search across content, people, and organizations
- Speaker, session, organization, location, map, and document views
- Conference merchandise catalogs and general feedback forms when published by organizers
- Local bookmarks and one-click iCalendar downloads
- Responsive layouts, keyboard navigation, visible focus states, and reduced-motion support
- Route-level code splitting and progressive rendering for large schedules and result sets
- Firestore request deduplication, batched document reads, and validated client-side caching
- Installable PWA shell with offline support for previously loaded data and assets

## Quick start

This repository uses [Vite+](https://viteplus.dev/guide/) (`vp`) for runtime management, dependency installation, development, checks, tests, and builds.

```sh
git clone https://github.com/junctor/hackertracker-web.git
cd hackertracker-web
vp install
vp dev
```

The development server prints its local URL when it starts. The app uses the configured public Hacker Tracker Firebase project, so no local environment file is required.

## Commands

| Command          | Purpose                                                |
| ---------------- | ------------------------------------------------------ |
| `vp install`     | Install the locked dependencies and configured runtime |
| `vp dev`         | Start the development server                           |
| `vp check`       | Check formatting, lint rules, and TypeScript           |
| `vp check --fix` | Apply formatting and safe automatic fixes              |
| `vp test`        | Run the test suite once                                |
| `vp run build`   | Type-check and create the production build in `dist/`  |
| `vp preview`     | Serve the production build locally                     |
| `vp env doctor`  | Diagnose local Vite+ or runtime problems               |

Use `vp run build`, not `vp build`, for a release build. The package script runs `vue-tsc`, builds the application, and creates `dist/404.html` for GitHub Pages client-side routing.

## Project structure

```text
src/
├── components/   Reusable interface and schedule components
├── composables/  Conference, schedule, bookmark, and route state
├── firebase/     Firestore client, data access, validation, and caching
├── layouts/      Conference-level navigation and page structure
├── lib/          Dates, routes, sorting, schedule transforms, and URL safety
├── styles/       Design tokens and shared global styles
├── types/        Firestore and UI data models
└── views/        Route-level, lazily loaded pages

public/
├── manifest.webmanifest
├── sw.js
└── install icons and static assets
```

Vue Router owns the application routes. Route views load on demand, shared Firestore access lives in `src/firebase/data.ts`, and UI-neutral data transforms live in `src/lib/`.

## Firebase and caching

The app uses the Firebase Lite SDK and avoids realtime listeners. Collection loads are cached by conference, simultaneous requests for the same cache key share one promise, and ID-based lookups are batched where Firestore supports them.

Freshness windows are deliberately matched to how often each data type changes:

| Data                                                      |  Fresh for |
| --------------------------------------------------------- | ---------: |
| Conferences, menus, and documents                         |    6 hours |
| Organizations and feedback forms                          | 30 minutes |
| Events, locations, tags, speakers, articles, and products | 10 minutes |

Validated responses are held in a small in-memory LRU cache and persisted to IndexedDB. Persistent entries are capped at 200, retained for up to seven days, and can be used as a stale fallback if a refresh fails. Maintenance pruning is rate-limited so ordinary navigation does not repeatedly scan IndexedDB.

The production service worker adds a separate cache for the application shell and same-origin static assets. Navigations are network-first; cached routes and Firebase data keep previously visited conference pages useful offline.

When changing cached data shapes, increment the cache prefix in `src/firebase/cache.ts`. When changing the service-worker shell strategy or its required assets, increment `CACHE_NAME` in `public/sw.js`.

## Design and accessibility

Shared colors, spacing, radii, shadows, layout widths, and control sizes live in `src/styles/tokens.css`. Prefer semantic tokens over component-specific color literals when extending the interface.

New UI should preserve the existing release bar:

- One logical `h1` per page with ordered section headings
- Semantic landmarks and accessible names for icon-only controls
- Keyboard-operable interactions and a minimum 44px control target
- No horizontal overflow at mobile widths
- Usable high-contrast and reduced-motion modes
- Progressive rendering for long lists rather than an unbounded initial DOM

## Validation

Run the complete local release gate before opening a pull request:

```sh
vp install
vp check
vp test
vp run build
vp preview
```

Tests cover cache behavior, core bookmark, calendar, date, and schedule utilities, menu routing, Markdown heading structure, and mounted component behavior. Add focused tests beside the source using `*.test.ts` when changing these behaviors.

## Deployment

GitHub Actions deploys `dist/` to GitHub Pages on every push to `main`; the workflow can also be started manually. The deployment job installs locked dependencies, runs checks and tests, builds the site, and publishes it to [hackertracker.app](https://hackertracker.app).

Static deployment details:

- `public/CNAME` configures the custom domain.
- `public/.nojekyll` prevents GitHub Pages from applying Jekyll processing.
- `dist/404.html` mirrors `index.html` so deep links return the Vue application.
- `public/manifest.webmanifest` and `public/sw.js` provide install and offline behavior.

## Contributing

Keep changes focused, preserve the established design system, and avoid bypassing the shared Firebase data layer. Before submitting work, confirm that the production build succeeds and check representative routes at both desktop and mobile widths.

If Vite+ setup or package behavior looks wrong, run `vp env doctor` and include its output with the issue.

## License

Released under the [MIT License](LICENSE).
