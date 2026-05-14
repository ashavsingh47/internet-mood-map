import type { RegionMood } from "@/data/mockMoodData";
import { moodStyles } from "@/lib/moodStyles";
import { formatMoodLabel } from "@/lib/moodUtils";

type RegionInsightProps = {
  region: RegionMood;
};

export function RegionInsight({ region }: RegionInsightProps) {
  return (
    <div className="glass-panel card-hover rounded-3xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Region Insight</p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            {region.city}
          </h2>

          <p className="mt-1 text-sm text-slate-400">{region.country}</p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${moodStyles[region.mood]}`}
        >
          {formatMoodLabel(region.mood)}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Mood Score</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {region.moodScore}/100
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Activity</p>

          <p className="mt-2 text-3xl font-bold capitalize tracking-tight text-white">
            {region.activityLevel}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-300">Trending Topics</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {region.trendingTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <p className="text-sm font-semibold text-slate-300">
          AI-Style Explanation
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          {region.explanation}
        </p>
      </div>
    </div>
  );
}
