type LoadingPageProps = {
  fullscreen?: boolean;
  message?: string;
};

export default function LoadingPage({
  fullscreen = true,
  message = "Fetching content…",
}: LoadingPageProps) {
  const wrap = fullscreen
    ? "relative grid min-h-[calc(100dvh-0px)] place-items-center"
    : "relative grid place-items-center py-10";

  return (
    <section className={`${wrap} text-center`} role="status" aria-live="polite" aria-busy="true">
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0" />
      <div aria-hidden className="vignette pointer-events-none absolute inset-0" />

      <div className="mx-auto px-4">
        <div className="isolation-isolate relative inline-block select-none">
          <h1 className="relative bg-[linear-gradient(90deg,#22d3ee_0%,#e879f9_20%,#f59e0b_40%,#22c55e_60%,#60a5fa_80%,#22d3ee_100%)] bg-[length:300%_100%] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent [filter:drop-shadow(0_0_10px_rgba(232,121,249,0.45))] motion-safe:animate-[slide_5s_linear_infinite] md:text-5xl">
            HT
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-8 inset-y-0 mix-blend-screen [background:linear-gradient(90deg,transparent_0%,rgba(34,211,238,.25)_45%,rgba(255,255,255,.5)_50%,rgba(232,121,249,.25)_55%,transparent_100%)] motion-safe:animate-[sweep_1.8s_ease-in-out_infinite]"
            />
          </h1>

          <span
            aria-hidden
            className="absolute inset-0 translate-x-[1.5px] -translate-y-[0.8px] text-cyan-300 opacity-95 mix-blend-screen"
          >
            HT
          </span>
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-[1.5px] translate-y-[0.8px] text-fuchsia-400 opacity-95 mix-blend-screen"
          >
            HT
          </span>
        </div>

        <p className="mt-3 font-mono text-xs text-gray-300/80 md:text-sm">{message}</p>
      </div>
    </section>
  );
}
