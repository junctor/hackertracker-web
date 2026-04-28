import { Link } from "react-router";

import { HTFooter } from "./HTFooter";
import { HTHeader } from "./HTHeader";

export default function ErrorPage({ msg }: { msg?: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <HTHeader />

      <main id="main" className="flex flex-1 items-center justify-center px-6">
        <div className="relative text-center">
          {/* Glitchy title */}
          <div className="isolation-isolate relative inline-block select-none">
            <h1 className="relative text-4xl font-extrabold tracking-tight text-red-400 motion-safe:animate-[glitch_2s_steps(12,end)_infinite] md:text-6xl">
              ERROR
              <span
                aria-hidden
                className="absolute inset-0 text-cyan-300 opacity-95 mix-blend-screen motion-safe:animate-[rgb_2.4s_ease-in-out_infinite]"
              >
                ERROR
              </span>
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-[2px] translate-y-[1px] text-fuchsia-400 opacity-95 mix-blend-screen motion-safe:animate-[rgb_2.4s_ease-in-out_infinite]"
                style={{ animationDelay: "0.15s" }}
              >
                ERROR
              </span>
            </h1>
          </div>

          {/* Message */}
          {msg ? (
            <pre
              role="alert"
              className="mx-auto mt-6 max-w-xl overflow-x-auto rounded-lg border border-red-700/70 bg-red-950/30 p-4 text-left font-mono text-xs text-red-200 md:text-sm"
            >
              {msg}
            </pre>
          ) : (
            <p className="mt-6 text-base text-gray-300">
              Something went sideways. Try again or head back home.
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-md border border-gray-600/70 px-4 py-2 text-sm font-semibold text-gray-100 transition-colors hover:border-gray-500 hover:bg-gray-800/70 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              Return Home
            </Link>
            <Link
              to="/support"
              className="rounded-md border border-gray-600/70 px-4 py-2 text-sm font-semibold text-gray-100 transition-colors hover:border-gray-500 hover:bg-gray-800/70 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <HTFooter />
    </div>
  );
}
