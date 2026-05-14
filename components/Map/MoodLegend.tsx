import type { Mood } from "@/data/mockMoodData";

const legendItems: { mood: Mood; color: string }[] = [
  { mood: "happy", color: "bg-emerald-400" },
  { mood: "angry", color: "bg-red-400" },
  { mood: "sad", color: "bg-blue-400" },
  { mood: "stressed", color: "bg-amber-400" },
  { mood: "excited", color: "bg-fuchsia-400" },
  { mood: "confused", color: "bg-yellow-400" },
  { mood: "fearful", color: "bg-rose-400" },
  { mood: "hopeful", color: "bg-cyan-400" },
  { mood: "chaotic", color: "bg-violet-400" },
];

export function MoodLegend() {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-300">Mood Legend</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {legendItems.map((item) => (
          <div key={item.mood} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${item.color}`} />
            <span className="text-sm capitalize text-slate-300">
              {item.mood}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
