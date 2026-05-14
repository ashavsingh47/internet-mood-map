import { MoodMapWrapper } from "@/components/Map/MoodMapWrapper";
import { RegionCard } from "@/components/Dashboard/RegionCard";
import { StatCard } from "@/components/Dashboard/StatCard";
import { mockMoodData } from "@/data/mockMoodData";
import { moodStyles } from "@/lib/moodStyles";
import {
  formatMoodLabel,
  getAverageMoodScore,
  getMostCommonMood,
} from "@/lib/moodUtils";

export default function DashboardPage() {
  const topRegions = mockMoodData.slice(0, 3);
  const globalMood = getMostCommonMood(mockMoodData);
  const averageMoodScore = getAverageMoodScore(mockMoodData);
  const globalMoodLabel = formatMoodLabel(globalMood);

  const highActivityRegions = mockMoodData.filter((region) => {
    return region.activityLevel === "high";
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Live Mood Intelligence
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Global Internet Mood Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-slate-300">
              Track emotional signals across regions using mood scores, trending
              topics, and AI-powered explanations.
            </p>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to Home
          </a>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Regions Sampled"
            value={mockMoodData.length}
            description="Mock regions currently powering the MVP."
          />

          <StatCard
            label="Average Mood Score"
            value={`${averageMoodScore}/100`}
            description="Average emotional intensity across all regions."
          />

          <StatCard
            label="High Activity Zones"
            value={highActivityRegions.length}
            description="Regions with strong conversation activity."
          />

          <StatCard
            label="Global Mood"
            value={globalMoodLabel}
            description="Most common mood detected in the sample."
          />
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6 shadow-2xl shadow-cyan-950/30">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mood Map</h2>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                Simulated Live
              </span>
            </div>

            <div className="h-[460px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
              <MoodMapWrapper regions={mockMoodData} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-cyan-300">
                  Current Global Mood
                </h2>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${moodStyles[globalMood]}`}
                >
                  {averageMoodScore}/100
                </span>
              </div>

              <p className="mt-4 text-5xl font-bold">{globalMoodLabel}</p>

              <p className="mt-3 text-slate-300">
                Based on {mockMoodData.length} sampled regions, the internet is
                currently showing a mostly {globalMood} emotional pattern.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-cyan-300">
                Trending Regions
              </h2>

              <div className="mt-4 space-y-3">
                {topRegions.map((region) => (
                  <RegionCard key={region.id} region={region} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
