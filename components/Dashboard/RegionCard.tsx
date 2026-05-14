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
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isSelected
          ? "border-cyan-400/40 bg-cyan-400/10"
          : "border-transparent bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{region.country}</p>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${moodStyles[region.mood]}`}
        >
          {region.mood}
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-400">
        {region.city} · score {region.moodScore} · {region.activityLevel}{" "}
        activity
      </p>

      <p className="mt-2 text-sm text-slate-300">
        {region.trendingTopics.join(" · ")}
      </p>
    </button>
  );
}
