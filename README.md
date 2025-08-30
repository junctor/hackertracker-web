# HackerTracker Web

HackerTracker Web is the web-based interface for the HackerTracker mobile applications. For mobile versions, check out the [Android](https://github.com/junctor/android) and [iOS](https://github.com/junctor/hackertracker) repositories.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) (version 8 or later)

### Installation

Install the necessary dependencies:

```bash
npm install
```

### Running the Development Server

Start the development server with:

```bash
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

Preview the build locally with:

```bash
npm run preview
```

The static assets will be generated in the `dist` directory. These can be deployed directly to GitHub Pages or any static host.

### Usage

After setting up the development environment, open the app at `http://localhost:5173` (or your configured dev server URL). Use the navigation menu to explore conferences, schedules, events, and more.

## Technologies Used

- **Bundler / Dev Server**: [Vite](https://vitejs.dev)
- **Routing**: [React Router](https://reactrouter.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com), [Headless UI](https://headlessui.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org)

## Contributors

Meet the HackerTracker Team:

- [Advice-Dog](https://github.com/Advice-Dog)
- [aNullValue](https://github.com/aNullValue)
- [cak](https://github.com/cak)
- [sethlaw](https://github.com/sethlaw)
