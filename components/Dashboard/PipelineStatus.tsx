const pipelineSteps = [
  {
    title: "Data Intake",
    description: "Simulated social/news signals",
  },
  {
    title: "Mood Scoring",
    description: "Emotion categories + intensity",
  },
  {
    title: "Geo Mapping",
    description: "Signals attached to regions",
  },
  {
    title: "Insight Layer",
    description: "AI-style regional explanations",
  },
];

export function PipelineStatus() {
  return (
    <div className="mb-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Mood Intelligence Pipeline
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Current MVP runs on realistic mock signals. Real API/NLP sources can
            plug into this same flow later.
          </p>
        </div>

        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
          System Online
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {pipelineSteps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
          >
            <p className="text-xs font-semibold text-cyan-300">
              Step {index + 1}
            </p>

            <h3 className="mt-2 font-semibold text-white">{step.title}</h3>

            <p className="mt-1 text-sm text-slate-400">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
