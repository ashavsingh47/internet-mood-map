import type { RegionMood } from "@/data/mockMoodData";
import { moodStyles } from "@/lib/moodStyles";
import { formatMoodLabel } from "@/lib/moodUtils";

type TopMoodSpikesProps = {
  regions: RegionMood[];
  onRegionSelect: (regionId: string) => void;
};

export function TopMoodSpikes({ regions, onRegionSelect }: TopMoodSpikesProps) {
  const topSpikes = [...regions]
    .sort((firstRegion, secondRegion) => {
      return secondRegion.moodScore - firstRegion.moodScore;
    })
    .slice(0, 5);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-cyan-300">Top Mood Spikes</h2>

        <p className="mt-2 text-sm text-slate-400">
          Regions with the strongest emotional signal right now.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {topSpikes.map((region, index) => (
          <button
            key={region.id}
            type="button"
            onClick={() => onRegionSelect(region.id)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">
                  #{index + 1} {region.city}
                </p>

                <p className="mt-1 text-sm text-slate-400">{region.country}</p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${moodStyles[region.mood]}`}
              >
                {formatMoodLabel(region.mood)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">Mood intensity</span>
              <span className="font-semibold text-white">
                {region.moodScore}/100
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
