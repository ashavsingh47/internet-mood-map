const featureCards = [
  {
    title: "Interactive Mood Map",
    description:
      "Explore emotional signals across global regions with live-style mood markers and region-level insights.",
  },
  {
    title: "Mood Intelligence",
    description:
      "Track emotional categories like hopeful, stressed, excited, chaotic, angry, and happy using structured mood scores.",
  },
  {
    title: "AI-Style Explanations",
    description:
      "Each region includes a plain-English explanation of why that area is showing a certain emotional pattern.",
  },
];

const pipelineSteps = [
  "Collect signals",
  "Classify mood",
  "Map by region",
  "Explain trends",
];

const techStack = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Leaflet",
  "Recharts",
];

export default function Home() {
  return (
    <main className="mood-bg min-h-screen text-white">
      <section className="mood-content mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-lg font-bold tracking-tight">
              Internet Mood Map
            </p>
            <p className="text-sm text-slate-400">
              Global emotional intelligence dashboard
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open Dashboard
          </a>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              Real-time emotional radar for the internet
            </div>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
              See how the world feels online.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Internet Mood Map is a portfolio-level data visualization app that
              turns global social, news, and community signals into mood scores,
              regional trends, interactive map markers, and AI-style
              explanations.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/dashboard"
                className="rounded-full bg-cyan-400 px-8 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Launch Mood Dashboard
              </a>

              <a
                href="#features"
                className="rounded-full border border-white/20 px-8 py-3 text-center font-semibold text-white transition hover:bg-white/10"
              >
                View Features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/40">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                  Live Preview
                </p>
                <h2 className="mt-2 text-2xl font-bold">Global Mood Pulse</h2>
              </div>

              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Online
              </span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80">
                <div className="relative h-44 w-72 rounded-full border border-cyan-400/20 bg-cyan-400/5">
                  <span className="absolute left-12 top-16 h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_24px_#fbbf24]" />
                  <span className="absolute left-32 top-10 h-4 w-4 rounded-full bg-fuchsia-400 shadow-[0_0_24px_#e879f9]" />
                  <span className="absolute right-16 top-24 h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_24px_#22d3ee]" />
                  <span className="absolute bottom-10 left-36 h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_24px_#34d399]" />
                  <span className="absolute bottom-16 right-10 h-4 w-4 rounded-full bg-violet-400 shadow-[0_0_24px_#a78bfa]" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Regions</p>
                  <p className="mt-2 text-2xl font-bold">17</p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Top Mood</p>
                  <p className="mt-2 text-2xl font-bold">Hopeful</p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Mode</p>
                  <p className="mt-2 text-2xl font-bold">Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="pb-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Product Features
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Built to feel like a real internet intelligence tool.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                <h3 className="text-xl font-semibold text-cyan-300">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                How It Works
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                From online signals to emotional map intelligence.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {pipelineSteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="text-sm font-semibold text-cyan-300">
                    Step {index + 1}
                  </p>

                  <p className="mt-2 font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
