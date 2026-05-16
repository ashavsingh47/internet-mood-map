import { mockMoodData, mockMoodHistory } from "@/data/mockMoodData";
import type { MoodHistoryPoint, RegionMood } from "@/types/mood";
import type {
  DataSourceResult,
  MoodDataSource,
  RawSignal,
} from "./types";

export type MockMoodDataSourceOptions = {
  /**
   * When true, apply small random offsets to mood scores so each call
   * looks slightly different (matches the previous /api/mood behavior).
   * When false, return the bundled data unchanged (deterministic).
   */
  simulateLiveDrift?: boolean;
};

function clampScore(score: number) {
  return Math.min(100, Math.max(0, score));
}

function randomOffset(maxChange: number) {
  return Math.floor(Math.random() * (maxChange * 2 + 1)) - maxChange;
}

function applyRegionDrift(region: RegionMood): RegionMood {
  const liveScore = clampScore(region.moodScore + randomOffset(6));
  return {
    ...region,
    moodScore: liveScore,
    explanation: `${region.explanation} Current live-style signal intensity is reading ${liveScore}/100.`,
  };
}

function applyHistoryDrift(point: MoodHistoryPoint): MoodHistoryPoint {
  return {
    time: point.time,
    happy: clampScore(point.happy + randomOffset(5)),
    stressed: clampScore(point.stressed + randomOffset(5)),
    excited: clampScore(point.excited + randomOffset(5)),
    hopeful: clampScore(point.hopeful + randomOffset(5)),
    chaotic: clampScore(point.chaotic + randomOffset(5)),
  };
}

/**
 * Wraps the existing mock dataset behind the MoodDataSource interface.
 *
 * Always available, never fails, and produces both:
 *   - a pre-built snapshot (the 17 mock regions + history points)
 *   - one RawSignal per region (so Phase 3 / Phase 4 code paths can be
 *     exercised against mock data without needing a real news feed)
 */
export class MockMoodDataSource implements MoodDataSource {
  readonly id = "mock";
  readonly label = "Mock Simulation";

  constructor(private readonly options: MockMoodDataSourceOptions = {}) {}

  isAvailable() {
    return true;
  }

  async fetchSignals(): Promise<DataSourceResult> {
    const shouldDrift = this.options.simulateLiveDrift === true;

    const regions: RegionMood[] = shouldDrift
      ? mockMoodData.map(applyRegionDrift)
      : mockMoodData.map((region) => ({ ...region }));

    const history: MoodHistoryPoint[] = shouldDrift
      ? mockMoodHistory.map(applyHistoryDrift)
      : mockMoodHistory.map((point) => ({ ...point }));

    const now = new Date().toISOString();

    const signals: RawSignal[] = regions.map((region) => ({
      id: `mock-${region.id}`,
      source: `mock:${region.id}`,
      publishedAt: now,
      text: region.explanation,
      region: {
        country: region.country,
        city: region.city,
        lat: region.lat,
        lng: region.lng,
      },
      keywords: [...region.trendingTopics],
    }));

    return {
      signals,
      snapshot: { regions, history },
      warnings: [],
    };
  }
}
