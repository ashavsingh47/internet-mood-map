export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
          Real-time emotional radar for the internet
        </p>

        <h1 className="max-w-5xl text-5xl font-bold tracking-tight sm:text-7xl">
          Internet Mood Map
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          A global dashboard that visualizes how the internet feels across
          different countries using mood colors, trending topics, sentiment
          signals, and AI-generated explanations.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/dashboard"
            className="rounded-full bg-cyan-400 px-8 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open Mood Dashboard
          </a>

          <a
            href="#features"
            className="rounded-full border border-white/20 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            View Features
          </a>
        </div>
      </section>

      <section id="features" className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-cyan-300">
              Global Mood Map
            </h2>
            <p className="mt-3 text-slate-300">
              Countries and cities will be colored based on emotional mood like
              happy, angry, stressed, hopeful, or chaotic.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-cyan-300">
              Trending Topics
            </h2>
            <p className="mt-3 text-slate-300">
              Each region will show what people are talking about and how those
              topics connect to the current mood.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-cyan-300">
              AI Explanations
            </h2>
            <p className="mt-3 text-slate-300">
              The app will explain why a region feels a certain way using
              sentiment signals, topic patterns, and AI summaries.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}