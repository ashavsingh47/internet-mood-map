import { getAverageMoodScore, getMostCommonMood } from "@/lib/moodUtils";
import type { MoodApiResponse, MoodDataMode } from "@/types/mood";
import { MockMoodDataSource } from "./mock-source";
import { RssMoodDataSource } from "./rss-source";
import type { DataSourceSnapshot } from "./types";

const KNOWN_MODES: readonly MoodDataMode[] = [
  "mock",
  "live-simulation",
  "hybrid",
  "real",
];

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

async function loadMockSnapshot(
  options: { simulateLiveDrift: boolean },
): Promise<DataSourceSnapshot> {
  const source = new MockMoodDataSource({
    simulateLiveDrift: options.simulateLiveDrift,
  });
  const result = await source.fetchSignals();
  if (!result.snapshot) {
    // Defensive: MockMoodDataSource always returns a snapshot, but the
    // type allows undefined so we narrow it explicitly.
    throw new Error("Mock data source did not return a snapshot.");
  }
  return result.snapshot;
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
 * Phase 2 does not yet turn raw text signals into a mood snapshot
 * (that's Phase 3 NLP scoring + Phase 4 region mapping). Until those
 * land, "hybrid" and "real" always end up falling back to live-simulation
 * with an explanatory warning.
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
          // We have signals but no snapshot yet (no NLP/region mapping
          // until Phase 3 + Phase 4). Be honest about it.
          warnings.push(
            "Signal-to-region scoring not yet implemented; falling back to live-simulation.",
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

  const snapshot = await loadMockSnapshot({
    simulateLiveDrift: resolvedMode !== "mock",
  });

  const globalMood = getMostCommonMood(snapshot.regions);
  const averageMoodScore = getAverageMoodScore(snapshot.regions);
  const highActivityRegions = snapshot.regions.filter((region) => {
    return region.activityLevel === "high";
  });

  const payload: MoodApiResponse = {
    status: "success",
    mode: resolvedMode,
    generatedAt: new Date().toISOString(),
    summary: {
      regionsSampled: snapshot.regions.length,
      globalMood,
      averageMoodScore,
      highActivityZones: highActivityRegions.length,
    },
    regions: snapshot.regions,
    history: snapshot.history,
  };

  if (warnings.length > 0) {
    payload.warnings = warnings;
  }

  return { payload, resolvedMode, warnings };
}
