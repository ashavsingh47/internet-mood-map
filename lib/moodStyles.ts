import type { Mood } from "@/data/mockMoodData";

export const moodStyles: Record<Mood, string> = {
  happy: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  angry: "bg-red-400/10 text-red-300 border-red-400/20",
  sad: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  stressed: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  excited: "bg-fuchsia-400/10 text-fuchsia-300 border-fuchsia-400/20",
  confused: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
  fearful: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  hopeful: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  chaotic: "bg-violet-400/10 text-violet-300 border-violet-400/20",
};