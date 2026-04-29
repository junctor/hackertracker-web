import { useMemo } from "react";
import { Link } from "react-router";

import { HTFooter } from "./HTFooter";
import { HTHeader } from "./HTHeader";

const messages = [
  "404: This path is off the grid. It either got wiped or never existed.",
  "Dead link detected. The resource you’re probing isn’t here.",
  "Nothing to see here—this route’s a ghost in the machine.",
  "Page not found. Either it’s been moved, or it was just a rumor.",
  "You’ve reached a null sector. No data lives at this address.",
  "Invalid opcode. This page cannot be executed.",
  "Access denied: target not in scope.",
  "Glitch in the system. That page never compiled.",
];

export default function NotFound() {
  const message = useMemo(() => messages[Math.floor(Math.random() * messages.length)], []);

  return (
    <div className="flex min-h-dvh flex-col">
      <HTHeader />

      <main id="main" className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 md:text-6xl">
            404 — Page not found
          </h1>
          <p className="mt-4 text-gray-400">{message}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/conferences"
              className="ui-btn-base ui-btn-secondary ui-focus-ring focus-visible:outline-none"
            >
              Browse Conferences
            </Link>
            <Link
              to="/"
              className="ui-btn-base ui-btn-secondary ui-focus-ring focus-visible:outline-none"
            >
              Home
            </Link>
          </div>
        </div>
      </main>

      <HTFooter />
    </div>
  );
}
