import type { RegionMood } from "@/data/mockMoodData";
import { moodStyles } from "@/lib/moodStyles";
import { formatMoodLabel } from "@/lib/moodUtils";

type RegionInsightProps = {
  region: RegionMood;
};

export function RegionInsight({ region }: RegionInsightProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-cyan-300">
            Region Insight
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {region.city}, {region.country}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${moodStyles[region.mood]}`}
        >
          {formatMoodLabel(region.mood)}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <p className="text-sm text-slate-400">Mood Score</p>
        <p className="mt-2 text-3xl font-bold">{region.moodScore}/100</p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-300">Trending Topics</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {region.trendingTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
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
