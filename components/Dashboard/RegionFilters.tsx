import type { Mood } from "@/data/mockMoodData";

type MoodFilter = Mood | "all";

type RegionFiltersProps = {
  searchQuery: string;
  selectedMood: MoodFilter;
  onSearchChange: (value: string) => void;
  onMoodChange: (value: MoodFilter) => void;
  onReset: () => void;
};

const moodOptions: MoodFilter[] = [
  "all",
  "happy",
  "angry",
  "sad",
  "stressed",
  "excited",
  "confused",
  "fearful",
  "hopeful",
  "chaotic",
];

export function RegionFilters({
  searchQuery,
  selectedMood,
  onSearchChange,
  onMoodChange,
  onReset,
}: RegionFiltersProps) {
  return (
    <div className="glass-panel card-hover rounded-3xl p-6">
      <div className="mb-5">
        <p className="section-kicker">Explore Signals</p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Search & Filter
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Search by country, city, mood signal, or trending topic.
        </p>
      </div>

      <div className="space-y-3">
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Canada, Tokyo, cricket, housing..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-slate-950"
        />

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <select
            value={selectedMood}
            onChange={(event) => onMoodChange(event.target.value as MoodFilter)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm capitalize text-white outline-none transition focus:border-cyan-400/60 focus:bg-slate-950"
          >
            {moodOptions.map((mood) => (
              <option key={mood} value={mood} className="bg-slate-950">
                {mood === "all" ? "All moods" : mood}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/20"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
