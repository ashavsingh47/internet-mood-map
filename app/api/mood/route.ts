import {
  mockMoodData,
  mockMoodHistory,
  type MoodHistoryPoint,
  type RegionMood,
} from "@/data/mockMoodData";
import { getAverageMoodScore, getMostCommonMood } from "@/lib/moodUtils";

export const dynamic = "force-dynamic";

function clampScore(score: number) {
  return Math.min(100, Math.max(0, score));
}

function randomOffset(maxChange: number) {
  return Math.floor(Math.random() * (maxChange * 2 + 1)) - maxChange;
}

function createLiveRegions(): RegionMood[] {
  return mockMoodData.map((region) => {
    const liveScore = clampScore(region.moodScore + randomOffset(6));

    return {
      ...region,
      moodScore: liveScore,
      explanation: `${region.explanation} Current live-style signal intensity is reading ${liveScore}/100.`,
    };
  });
}

function createLiveHistory(): MoodHistoryPoint[] {
  return mockMoodHistory.map((point) => {
    return {
      time: point.time,
      happy: clampScore(point.happy + randomOffset(5)),
      stressed: clampScore(point.stressed + randomOffset(5)),
      excited: clampScore(point.excited + randomOffset(5)),
      hopeful: clampScore(point.hopeful + randomOffset(5)),
      chaotic: clampScore(point.chaotic + randomOffset(5)),
    };
  });
}

export async function GET() {
  const liveRegions = createLiveRegions();
  const liveHistory = createLiveHistory();

  const globalMood = getMostCommonMood(liveRegions);
  const averageMoodScore = getAverageMoodScore(liveRegions);

  const highActivityRegions = liveRegions.filter((region) => {
    return region.activityLevel === "high";
  });

  return Response.json(
    {
      status: "success",
      mode: "live-simulation",
      generatedAt: new Date().toISOString(),
      summary: {
        regionsSampled: liveRegions.length,
        globalMood,
        averageMoodScore,
        highActivityZones: highActivityRegions.length,
      },
      regions: liveRegions,
      history: liveHistory,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
