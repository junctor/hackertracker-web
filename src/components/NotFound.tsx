import { Link } from "react-router";
import { useMemo } from "react";
import { HTHeader } from "./HTHeader";
import { HTFooter } from "./HTFooter";

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
  const message = useMemo(
    () => messages[Math.floor(Math.random() * messages.length)],
    []
  );

  return (
    <div className="min-h-dvh flex flex-col">
      <HTHeader />

      <main id="main" className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-100">
            404 — Page not found
          </h1>
          <p className="mt-4 text-gray-400">{message}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/conferences"
              className="rounded-md border border-gray-700 px-4 py-2
                         text-gray-200 hover:bg-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         transition-colors"
            >
              Browse Conferences
            </Link>
            <Link
              to="/"
              className="rounded-md border border-gray-700 px-4 py-2
                         text-gray-200 hover:bg-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         transition-colors"
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
