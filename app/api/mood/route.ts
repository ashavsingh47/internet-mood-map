import { mockMoodData, mockMoodHistory } from "@/data/mockMoodData";
import { getAverageMoodScore, getMostCommonMood } from "@/lib/moodUtils";

export async function GET() {
  const globalMood = getMostCommonMood(mockMoodData);
  const averageMoodScore = getAverageMoodScore(mockMoodData);

  const highActivityRegions = mockMoodData.filter((region) => {
    return region.activityLevel === "high";
  });

  return Response.json({
    status: "success",
    generatedAt: new Date().toISOString(),
    summary: {
      regionsSampled: mockMoodData.length,
      globalMood,
      averageMoodScore,
      highActivityZones: highActivityRegions.length,
    },
    regions: mockMoodData,
    history: mockMoodHistory,
  });
}
