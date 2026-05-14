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
    <div className="glass-panel card-hover rounded-3xl p-6">
      <div>
        <p className="section-kicker">Live Spike Detection</p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Top Mood Spikes
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Regions with the strongest emotional intensity signals right now.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {topSpikes.map((region, index) => (
          <button
            key={region.id}
            type="button"
            onClick={() => onRegionSelect(region.id)}
            className="group w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm font-bold text-cyan-300">
                  {index + 1}
                </div>

                <div>
                  <p className="font-semibold text-white transition group-hover:text-cyan-200">
                    {region.city}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {region.country}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${moodStyles[region.mood]}`}
              >
                {formatMoodLabel(region.mood)}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Mood intensity</span>

                <span className="font-semibold text-white">
                  {region.moodScore}/100
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.7)]"
                  style={{ width: `${region.moodScore}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
