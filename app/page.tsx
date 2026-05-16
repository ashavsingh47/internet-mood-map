const featureCards = [
  {
    title: "Global Mood Map",
    description: "Interactive world map with live-style emotional markers.",
  },
  {
    title: "Mood Spikes",
    description: "Detects regions with the strongest emotional intensity.",
  },
  {
    title: "AI-Style Insights",
    description: "Explains why each region is showing a certain mood.",
  },
];

const techStack = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind",
  "Leaflet",
  "Recharts",
  "API Routes",
];

export default function Home() {
  return (
    <main className="mood-bg min-h-screen text-white">
      <section className="mood-content relative mx-auto flex min-h-screen max-w-7xl flex-col overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="hero-glow-orb left-[-120px] top-32 h-72 w-72 bg-cyan-400/20" />
        <div className="hero-glow-orb bottom-10 right-[-140px] h-80 w-80 bg-fuchsia-500/20" />

        <nav className="animate-fade-up flex items-center justify-between border-b border-white/10 pb-5">
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
            className="premium-button rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200"
          >
            Open Dashboard
          </a>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <div className="animate-fade-up delay-100 mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              Real-time inspired emotional radar
            </div>

            <h1 className="animate-fade-up delay-200 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              See how the internet feels.
            </h1>

            <p className="animate-fade-up delay-300 mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A full-stack data visualization app that turns global social,
              news, and community signals into mood scores, regional spikes,
              interactive map markers, and AI-style explanations.
            </p>

            <div className="animate-fade-up delay-400 mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="/dashboard"
                className="premium-button rounded-full bg-cyan-400 px-7 py-3 text-center font-bold text-slate-950 hover:bg-cyan-300"
              >
                Launch Dashboard
              </a>

              <a
                href="https://github.com/ashavsingh47/internet-mood-map"
                className="premium-button rounded-full border border-white/20 px-7 py-3 text-center font-bold text-white hover:bg-white/10"
              >
                View GitHub
              </a>
            </div>

            <div className="animate-fade-up delay-500 mt-7 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up animate-float-card delay-500 glass-panel glass-panel-cyan rounded-[2rem] p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Live Preview</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Global Mood Pulse
                </h2>
              </div>

              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Online
              </span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_55%),#020617]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:36px_36px]" />

                <div className="animate-slow-spin absolute h-64 w-64 rounded-full border border-cyan-400/10" />
                <div className="animate-slow-spin absolute h-44 w-44 rounded-full border border-fuchsia-400/10 [animation-direction:reverse]" />

                <div className="relative h-44 w-80 rounded-[999px] border border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_90px_rgba(34,211,238,0.16)]">
                  <span className="animate-glow-pulse absolute left-12 top-16 h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_28px_#fbbf24]" />
                  <span className="animate-glow-pulse delay-200 absolute left-36 top-9 h-4 w-4 rounded-full bg-fuchsia-400 shadow-[0_0_28px_#e879f9]" />
                  <span className="animate-glow-pulse delay-300 absolute right-20 top-24 h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_28px_#22d3ee]" />
                  <span className="animate-glow-pulse delay-400 absolute bottom-10 left-40 h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_28px_#34d399]" />
                  <span className="animate-glow-pulse delay-500 absolute bottom-16 right-10 h-4 w-4 rounded-full bg-violet-400 shadow-[0_0_28px_#a78bfa]" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Regions</p>
                  <p className="mt-1 text-3xl font-black">17</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Top Mood</p>
                  <p className="mt-1 text-3xl font-black">Hopeful</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Mode</p>
                  <p className="mt-1 text-3xl font-black">Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="animate-fade-up delay-700 grid gap-4 pb-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="glass-panel card-hover rounded-3xl p-5"
            >
              <h3 className="text-xl font-bold text-cyan-300">
                {feature.title}
              </h3>

              <p className="mt-2 leading-7 text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
