import type { RegionMood } from "@/data/mockMoodData";
import { moodStyles } from "@/lib/moodStyles";

type RegionCardProps = {
  region: RegionMood;
  isSelected?: boolean;
  onClick?: () => void;
};

export function RegionCard({ region, isSelected, onClick }: RegionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border p-4 text-left transition ${
        isSelected
          ? "border-cyan-400/50 bg-cyan-400/15 shadow-[0_0_28px_rgba(34,211,238,0.14)]"
          : "border-white/10 bg-slate-950/60 hover:border-cyan-400/35 hover:bg-cyan-400/10"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white transition group-hover:text-cyan-200">
            {region.city}
          </p>

          <p className="mt-1 text-sm text-slate-400">{region.country}</p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${moodStyles[region.mood]}`}
        >
          {region.mood}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Score {region.moodScore}/100 · {region.activityLevel} activity
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
        {region.trendingTopics.join(" · ")}
      </p>
    </button>
  );
}
