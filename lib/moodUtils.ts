import type { Mood, RegionMood } from "@/data/mockMoodData";

export function getMostCommonMood(regions: RegionMood[]): Mood {
  if (regions.length === 0) {
    return "hopeful";
  }

  const moodCounts: Record<string, number> = {};

  for (const region of regions) {
    moodCounts[region.mood] = (moodCounts[region.mood] || 0) + 1;
  }

  const mostCommonMood = Object.entries(moodCounts).sort(
    (firstMood, secondMood) => secondMood[1] - firstMood[1],
  )[0][0];

  return mostCommonMood as Mood;
}

export function getAverageMoodScore(regions: RegionMood[]): number {
  if (regions.length === 0) {
    return 0;
  }

  const totalScore = regions.reduce((total, region) => {
    return total + region.moodScore;
  }, 0);

  return Math.round(totalScore / regions.length);
}

export function formatMoodLabel(mood: Mood): string {
  return mood.charAt(0).toUpperCase() + mood.slice(1);
}