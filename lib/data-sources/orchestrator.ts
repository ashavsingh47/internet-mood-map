import { aggregateEmotionScores } from "@/lib/nlp/emotionScoring";
import { getAverageMoodScore, getMostCommonMood } from "@/lib/moodUtils";
import type {
  MoodApiResponse,
  MoodDataMode,
  RegionMood,
  SourceSummary,
} from "@/types/mood";
import { MockMoodDataSource } from "./mock-source";
import { RssMoodDataSource, getRssFeedUrls } from "./rss-source";
import { matchSignalsToRegions } from "./regionMatcher";
import { buildRealRegions } from "./realRegionBuilder";
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
    throw new Error("Mock data source did not return a snapshot.");
  }
  return { snapshot: result.snapshot, signals: result.signals };
}

function groupSignalsByRegionId(
  signals: readonly RawSignal[],
): Map<string, RawSignal[]> {
  const map = new Map<string, RawSignal[]>();
  for (const signal of signals) {
    const id = signal.source.startsWith(MOCK_SIGNAL_PREFIX)
      ? signal.source.slice(MOCK_SIGNAL_PREFIX.length)
      : "";
    const existing = map.get(id);
    if (existing) existing.push(signal);
    else map.set(id, [signal]);
  }
  return map;
}

/**
 * Enrich each region with NLP-derived metadata (confidence, matched
 * keywords, signal count) WITHOUT changing the existing mood/moodScore
 * fields. Used for the mock/live-simulation paths so the dashboard looks
 * identical while the NLP output is still observable through the API.
 */
function enrichRegionsWithMockNlp(
  regions: readonly RegionMood[],
  signals: readonly RawSignal[],
): RegionMood[] {
  if (signals.length === 0) return regions.map((region) => ({ ...region }));

  const signalsByRegion = groupSignalsByRegionId(signals);

  return regions.map((region) => {
    const regionSignals = signalsByRegion.get(region.id) ?? [];
    if (regionSignals.length === 0) return { ...region };

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

type RealFetchOutcome =
  | { kind: "unavailable"; warnings: string[] }
  | { kind: "empty"; warnings: string[] }
  | { kind: "no-matches"; warnings: string[]; sourceSummary: SourceSummary }
  | { kind: "error"; warnings: string[] }
  | {
      kind: "ok";
      warnings: string[];
      regions: RegionMood[];
      sourceSummary: SourceSummary;
    };

/**
 * Try to produce real-derived regions from the RSS data source.
 *
 * This function NEVER throws — every failure path is encoded in the
 * returned discriminated union so the orchestrator can pick a sensible
 * fallback.
 */
async function tryFetchRealRegions(
  options: BuildMoodSnapshotOptions,
): Promise<RealFetchOutcome> {
  const feedUrls = getRssFeedUrls();
  const rss = new RssMoodDataSource();

  if (!rss.isAvailable()) {
    return {
      kind: "unavailable",
      warnings: [
        "Real data sources are not configured; set RSS_FEED_URLS to enable hybrid/real mode.",
      ],
    };
  }

  try {
    const result = await rss.fetchSignals({ signal: options.signal });
    const warnings = [...result.warnings];

    if (result.signals.length === 0) {
      return { kind: "empty", warnings };
    }

    const { matched, unmatched } = matchSignalsToRegions(result.signals);
    const baseSummary: SourceSummary = {
      sourceCount: feedUrls.length,
      signalCount: result.signals.length,
      matchedSignalCount: matched.length,
      unmatchedSignalCount: unmatched.length,
    };

    if (matched.length === 0) {
      warnings.push(
        `Fetched ${result.signals.length} signal(s) but none mapped to a known region.`,
      );
      return {
        kind: "no-matches",
        warnings,
        sourceSummary: baseSummary,
      };
    }

    const realRegions = buildRealRegions(matched);

    return {
      kind: "ok",
      warnings,
      regions: realRegions,
      sourceSummary: baseSummary,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    return {
      kind: "error",
      warnings: [`Real data source failed: ${message}.`],
    };
  }
}

/**
 * Replace mock regions with real-derived ones where available.
 * Used by hybrid mode so the map always has 17 markers.
 */
function blendRealAndMockRegions(
  realRegions: readonly RegionMood[],
  mockRegions: readonly RegionMood[],
): RegionMood[] {
  if (realRegions.length === 0) return mockRegions.map((r) => ({ ...r }));

  const realById = new Map(realRegions.map((region) => [region.id, region]));
  return mockRegions.map((mockRegion) => {
    const real = realById.get(mockRegion.id);
    return real ?? { ...mockRegion };
  });
}

function summarize(regions: readonly RegionMood[]) {
  const globalMood = getMostCommonMood([...regions]);
  const averageMoodScore = getAverageMoodScore([...regions]);
  const highActivityZones = regions.filter(
    (region) => region.activityLevel === "high",
  ).length;
  return {
    regionsSampled: regions.length,
    globalMood,
    averageMoodScore,
    highActivityZones,
  };
}

/**
 * The single entry point used by /api/mood.
 *
 * Per mode:
 *   - "mock"            : deterministic mock data + NLP-enriched fields
 *   - "live-simulation" : mock data + random drift + NLP-enriched fields
 *   - "hybrid"          : real RSS for regions that match, mock fallback
 *                         for the rest. Falls back fully if RSS fails.
 *   - "real"            : only real RSS regions. Falls back to
 *                         live-simulation entirely if RSS is unavailable,
 *                         empty, errors, or produces zero region matches.
 *
 * Always returns a valid MoodApiResponse with at least one region for
 * mock/live-simulation/hybrid; "real" can validly return fewer than 17
 * regions (only those with matched signals) when RSS is working.
 *
 * History points stay mock in Phase 4. Phase 6 introduces snapshot-backed
 * history.
 */
export async function buildMoodSnapshot(
  options: BuildMoodSnapshotOptions,
): Promise<BuildMoodSnapshotResult> {
  const warnings: string[] = [];
  const requested = options.requestedMode;
  let resolvedMode: MoodDataMode = requested;
  let sourceSummary: SourceSummary | undefined;
  let regions: RegionMood[] = [];

  const wantsReal = requested === "real" || requested === "hybrid";
  const mock = await loadMockSnapshot({
    simulateLiveDrift: requested !== "mock",
  });

  if (wantsReal) {
    const outcome = await tryFetchRealRegions(options);
    warnings.push(...outcome.warnings);

    if (outcome.kind === "ok") {
      sourceSummary = outcome.sourceSummary;

      if (requested === "hybrid") {
        // Mix real-derived regions onto the full 17-region template so
        // the map and dashboard stay populated.
        regions = blendRealAndMockRegions(outcome.regions, mock.snapshot.regions);
        // Mock-filled regions also get NLP enrichment for consistency.
        regions = enrichRegionsWithMockNlpExcept(
          regions,
          mock.signals,
          new Set(outcome.regions.map((r) => r.id)),
        );
        // The blend kept the requested mode unchanged.
        resolvedMode = "hybrid";
      } else {
        // real: return ONLY the matched regions.
        regions = outcome.regions;
        resolvedMode = "real";
      }
    } else {
      // Any non-ok outcome means we couldn't produce real regions.
      // Fall back to live-simulation across the full 17-region template.
      if (outcome.kind === "no-matches") {
        sourceSummary = outcome.sourceSummary;
      }
      regions = enrichRegionsWithMockNlp(mock.snapshot.regions, mock.signals);
      resolvedMode = "live-simulation";
      warnings.push("Falling back to live-simulation.");
    }
  } else {
    // mock / live-simulation
    regions = enrichRegionsWithMockNlp(mock.snapshot.regions, mock.signals);
    resolvedMode = requested;
  }

  const payload: MoodApiResponse = {
    status: "success",
    mode: resolvedMode,
    generatedAt: new Date().toISOString(),
    summary: summarize(regions),
    regions,
    history: mock.snapshot.history,
  };

  if (warnings.length > 0) payload.warnings = warnings;
  if (sourceSummary) payload.sourceSummary = sourceSummary;

  return { payload, resolvedMode, warnings };
}

/**
 * Like enrichRegionsWithMockNlp but skips a set of region ids (used in
 * hybrid mode so we don't overwrite the NLP metadata already attached by
 * the real-region builder).
 */
function enrichRegionsWithMockNlpExcept(
  regions: readonly RegionMood[],
  signals: readonly RawSignal[],
  skipIds: ReadonlySet<string>,
): RegionMood[] {
  if (signals.length === 0) return regions.map((region) => ({ ...region }));

  const signalsByRegion = groupSignalsByRegionId(signals);

  return regions.map((region) => {
    if (skipIds.has(region.id)) return region;

    const regionSignals = signalsByRegion.get(region.id) ?? [];
    if (regionSignals.length === 0) return { ...region };

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
