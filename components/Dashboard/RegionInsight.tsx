import {
  formatConfidence,
  getConfidenceClassName,
  getConfidenceTier,
} from "@/lib/confidence";
import { moodStyles } from "@/lib/moodStyles";
import { formatMoodLabel } from "@/lib/moodUtils";
import type { RegionMood } from "@/types/mood";

type RegionInsightProps = {
  region: RegionMood;
};

/**
 * Returns the matched keywords that aren't already shown in the
 * `trendingTopics` list, so the UI doesn't render the same word in
 * two adjacent sections. Falls back to the raw list when there's no
 * overlap.
 */
function getUniqueMatchedKeywords(region: RegionMood): string[] {
  const keywords = region.matchedKeywords ?? [];
  if (keywords.length === 0) return [];

  const topicSet = new Set(
    region.trendingTopics.map((topic) => topic.toLowerCase()),
  );
  const unique = keywords.filter(
    (keyword) => !topicSet.has(keyword.toLowerCase()),
  );

  // If every matched keyword is already a trending topic, still show
  // the keywords so the user can see what the NLP detected.
  return unique.length > 0 ? unique : keywords;
}

export function RegionInsight({ region }: RegionInsightProps) {
  const hasConfidence = typeof region.confidence === "number";
  const hasSignalCount =
    typeof region.signalCount === "number" && region.signalCount > 0;
  const matchedKeywords = getUniqueMatchedKeywords(region);

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

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${moodStyles[region.mood]}`}
          >
            {formatMoodLabel(region.mood)}
          </span>

          {hasConfidence ? (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getConfidenceClassName(region.confidence)}`}
              title={`NLP confidence: ${formatConfidence(region.confidence)}`}
            >
              {getConfidenceTier(region.confidence)} ·{" "}
              {formatConfidence(region.confidence)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">Mood Score</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {region.moodScore}/100
          </p>

          {hasSignalCount ? (
            <p className="mt-1 text-xs text-slate-500">
              Based on{" "}
              <span className="font-semibold text-slate-300">
                {region.signalCount}
              </span>{" "}
              {region.signalCount === 1 ? "signal" : "signals"}
            </p>
          ) : null}
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

      {matchedKeywords.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-300">
            Matched Signal Keywords
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {matchedKeywords.slice(0, 12).map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      ) : null}

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
