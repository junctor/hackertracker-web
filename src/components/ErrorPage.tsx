import { Link } from "react-router";
import { HTHeader } from "./HTHeader";
import { HTFooter } from "./HTFooter";

export default function ErrorPage({ msg }: { msg?: string }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <HTHeader />

      <main id="main" className="flex-1 flex items-center justify-center px-6">
        <div className="relative text-center">
          {/* Glitchy title */}
          <div className="relative inline-block select-none isolation-isolate">
            <h1
              className="
                relative text-4xl md:text-6xl font-extrabold tracking-tight
                text-red-400
                motion-safe:animate-[glitch_2s_steps(12,end)_infinite]
              "
            >
              ERROR
              <span
                aria-hidden
                className="absolute inset-0 text-cyan-300 mix-blend-screen opacity-95
                           motion-safe:animate-[rgb_2.4s_ease-in-out_infinite]"
              >
                ERROR
              </span>
              <span
                aria-hidden
                className="absolute inset-0 text-fuchsia-400 mix-blend-screen opacity-95
                           -translate-x-[2px] translate-y-[1px]
                           motion-safe:animate-[rgb_2.4s_ease-in-out_infinite]"
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
              className="mx-auto mt-6 max-w-xl overflow-x-auto rounded-lg
                         border border-red-700/70 bg-red-950/30 p-4 text-left
                         font-mono text-xs md:text-sm text-red-200"
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
              className="rounded-md border border-gray-600/70 px-4 py-2
                         text-sm font-semibold text-gray-100
                         hover:bg-gray-800/70 hover:border-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         transition-colors"
            >
              Return Home
            </Link>
            <Link
              to="/support"
              className="rounded-md border border-gray-600/70 px-4 py-2
                         text-sm font-semibold text-gray-100
                         hover:bg-gray-800/70 hover:border-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         transition-colors"
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
