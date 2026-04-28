import { Link } from "react-router";

import { HTFooter } from "./HTFooter";
import { HTHeader } from "./HTHeader";

export default function ErrorPage({ msg }: { msg?: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <HTHeader />

      <main id="main" className="flex flex-1 items-center justify-center px-6">
        <div className="ui-card relative w-full max-w-2xl px-6 py-7 text-center sm:px-8 sm:py-9">
          <h1 className="text-3xl font-semibold text-balance text-gray-100 sm:text-4xl">
            We couldn&apos;t load this page
          </h1>

          {msg ? (
            <pre
              role="alert"
              className="mx-auto mt-6 max-h-[40dvh] max-w-xl overflow-auto rounded-xl border border-red-400/20 bg-red-950/25 p-4 text-left font-mono text-xs leading-6 whitespace-pre-wrap text-red-100 md:text-sm"
            >
              {msg}
            </pre>
          ) : (
            <p role="alert" className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300">
              Try again in a moment, or head back home.
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="ui-btn-base ui-btn-secondary ui-focus-ring focus-visible:outline-none"
            >
              Return Home
            </Link>
            <Link
              to="/support"
              className="ui-btn-base ui-btn-secondary ui-focus-ring focus-visible:outline-none"
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
