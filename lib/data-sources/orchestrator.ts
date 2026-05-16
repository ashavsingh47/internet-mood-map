import { aggregateEmotionScores } from "@/lib/nlp/emotionScoring";
import { getAverageMoodScore, getMostCommonMood } from "@/lib/moodUtils";
import type {
  MoodApiResponse,
  MoodDataMode,
  RegionMood,
} from "@/types/mood";
import { MockMoodDataSource } from "./mock-source";
import { RssMoodDataSource } from "./rss-source";
import type { DataSourceSnapshot, RawSignal } from "./types";

const KNOWN_MODES: readonly MoodDataMode[] = [
  "mock",
  "live-simulation",
  "hybrid",
  "real",
];

const MOCK_SIGNAL_PREFIX = "mock:";

/**
 * Resolve the data source mode from (in order of priority):
 *   1. an explicit override (typically a `?mode=` query param)
 *   2. the MOOD_DATA_MODE environment variable
 *   3. the safe default: "live-simulation"
 *
 * Unknown values fall back to "live-simulation" so a typo in env config
 * can never break /api/mood.
 */
export function resolveDataMode(override?: string | null): MoodDataMode {
  const candidates = [override, process.env.MOOD_DATA_MODE];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = candidate.trim().toLowerCase();
    const match = KNOWN_MODES.find((mode) => mode === normalized);
    if (match) return match;
  }

  return "live-simulation";
}

export type BuildMoodSnapshotOptions = {
  /** Mode requested by the caller (typically from ?mode= or env). */
  requestedMode: MoodDataMode;
  /** Optional AbortSignal forwarded to data sources. */
  signal?: AbortSignal;
};

export type BuildMoodSnapshotResult = {
  payload: MoodApiResponse;
  /** The mode that was actually used to build the response (may differ from requested after fallback). */
  resolvedMode: MoodDataMode;
  warnings: string[];
};

type MockLoadResult = {
  snapshot: DataSourceSnapshot;
  signals: RawSignal[];
};

async function loadMockSnapshot(
  options: { simulateLiveDrift: boolean },
): Promise<MockLoadResult> {
  const source = new MockMoodDataSource({
    simulateLiveDrift: options.simulateLiveDrift,
  });
  const result = await source.fetchSignals();
  if (!result.snapshot) {
    // Defensive: MockMoodDataSource always returns a snapshot, but the
    // type allows undefined so we narrow it explicitly.
    throw new Error("Mock data source did not return a snapshot.");
  }
  return { snapshot: result.snapshot, signals: result.signals };
}

/**
 * Build a quick lookup of signals grouped by the region id encoded in
 * `signal.source`. The mock source uses `"mock:<regionId>"` so we just
 * strip that prefix.
 *
 * Signals whose source does not follow the convention are placed under
 * an empty key so they don't accidentally pollute a real region.
 */
function groupSignalsByRegionId(
  signals: readonly RawSignal[],
): Map<string, RawSignal[]> {
  const map = new Map<string, RawSignal[]>();

  for (const signal of signals) {
    const id = signal.source.startsWith(MOCK_SIGNAL_PREFIX)
      ? signal.source.slice(MOCK_SIGNAL_PREFIX.length)
      : "";
    const existing = map.get(id);
    if (existing) {
      existing.push(signal);
    } else {
      map.set(id, [signal]);
    }
  }

  return map;
}

/**
 * Enrich each region with NLP-derived metadata (confidence, matched
 * keywords, signal count) without changing the existing mood/moodScore
 * fields. This keeps the dashboard visually identical for mock /
 * live-simulation modes while making the NLP output observable through
 * the API for any future UI work.
 */
function enrichRegionsWithNlp(
  regions: readonly RegionMood[],
  signals: readonly RawSignal[],
): RegionMood[] {
  if (signals.length === 0) {
    return regions.map((region) => ({ ...region }));
  }

  const signalsByRegion = groupSignalsByRegionId(signals);

  return regions.map((region) => {
    const regionSignals = signalsByRegion.get(region.id) ?? [];
    if (regionSignals.length === 0) {
      return { ...region };
    }

    // Combine signal text plus any pre-extracted keywords so the
    // dictionary has the best chance of finding evidence.
    const texts = regionSignals.map((signal) => {
      const keywordsBlob = (signal.keywords ?? []).join(" ");
      return `${signal.text} ${keywordsBlob}`.trim();
    });

    const aggregate = aggregateEmotionScores(texts);

    return {
      ...region,
      confidence: aggregate.confidence,
      matchedKeywords: aggregate.matchedKeywords,
      signalCount: aggregate.signalCount,
    };
  });
}

/**
 * The single entry point used by /api/mood.
 *
 * Honors the requested mode but always degrades gracefully:
 *   - "mock"            -> deterministic mock data (no random drift)
 *   - "live-simulation" -> mock data + small random drift (current MVP behavior)
 *   - "hybrid" / "real" -> try the real source; on any failure or empty
 *                         result, fall back to live-simulation and add a
 *                         warning so the client can show a badge.
 *
 * NLP scoring (Phase 3) runs against whatever signals the active source
 * produces; the result is attached to each region as optional metadata
 * (`confidence`, `matchedKeywords`, `signalCount`). Existing fields are
 * untouched, so existing UI keeps working unchanged.
 *
 * Hybrid/real modes still fall back to live-simulation until Phase 4
 * wires actual signal-to-region mapping for external sources.
 */
export async function buildMoodSnapshot(
  options: BuildMoodSnapshotOptions,
): Promise<BuildMoodSnapshotResult> {
  const warnings: string[] = [];
  const requested = options.requestedMode;
  let resolvedMode: MoodDataMode = requested;

  const wantsReal = requested === "real" || requested === "hybrid";

  if (wantsReal) {
    const rssSource = new RssMoodDataSource();
    const available = await Promise.resolve(rssSource.isAvailable());

    if (!available) {
      warnings.push(
        "Real data sources are not configured; falling back to live-simulation.",
      );
      resolvedMode = "live-simulation";
    } else {
      try {
        const result = await rssSource.fetchSignals({ signal: options.signal });
        warnings.push(...result.warnings);

        if (!result.snapshot && result.signals.length === 0) {
          warnings.push(
            "No usable signals were produced by real data sources; falling back to live-simulation.",
          );
          resolvedMode = "live-simulation";
        } else if (!result.snapshot) {
          // Signals exist but we don't yet map them onto the 17-region
          // template (Phase 4). NLP scoring is wired and ready for that
          // mapping; for now we still fall back to mock.
          warnings.push(
            "Signal-to-region mapping not yet implemented; falling back to live-simulation.",
          );
          resolvedMode = "live-simulation";
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        warnings.push(
          `Real data source failed (${message}); falling back to live-simulation.`,
        );
        resolvedMode = "live-simulation";
      }
    }
  }

  const { snapshot, signals } = await loadMockSnapshot({
    simulateLiveDrift: resolvedMode !== "mock",
  });

  const enrichedRegions = enrichRegionsWithNlp(snapshot.regions, signals);

  const globalMood = getMostCommonMood(enrichedRegions);
  const averageMoodScore = getAverageMoodScore(enrichedRegions);
  const highActivityRegions = enrichedRegions.filter((region) => {
    return region.activityLevel === "high";
  });

  const payload: MoodApiResponse = {
    status: "success",
    mode: resolvedMode,
    generatedAt: new Date().toISOString(),
    summary: {
      regionsSampled: enrichedRegions.length,
      globalMood,
      averageMoodScore,
      highActivityZones: highActivityRegions.length,
    },
    regions: enrichedRegions,
    history: snapshot.history,
  };

  if (warnings.length > 0) {
    payload.warnings = warnings;
  }

  return { payload, resolvedMode, warnings };
}
