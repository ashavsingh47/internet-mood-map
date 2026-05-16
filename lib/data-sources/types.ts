/**
 * Shared types for the mood data source layer.
 *
 * A "data source" is anything that can produce signals about how a region
 * (or the world) feels right now. Examples:
 *   - the bundled mock data (already structured)
 *   - an RSS news feed (raw text headlines)
 *   - the GDELT global events dataset (raw events)
 *
 * Sources emit `RawSignal`s. Higher layers (NLP scoring in Phase 3, region
 * mapping in Phase 4) turn those signals into the structured `RegionMood`
 * snapshot the dashboard already understands.
 *
 * Some sources (like the mock adapter) ALREADY have structured data, so they
 * may also return a `snapshot` directly. The orchestrator prefers a snapshot
 * if one is provided, otherwise it builds one from signals.
 */

import type { MoodHistoryPoint, RegionMood } from "@/types/mood";

/** A loose hint about where a signal came from geographically. */
export type RawSignalRegionHint = {
  country?: string;
  city?: string;
  lat?: number;
  lng?: number;
};

/**
 * A single piece of text-flavoured input from the outside world.
 * Phase 3's emotion scorer will read `text` (and optionally `keywords`)
 * to produce a mood category and score.
 */
export type RawSignal = {
  id: string;
  /** Identifier of the originating source, e.g. "mock:canada-toronto", "rss:reuters-world". */
  source: string;
  /** ISO 8601 timestamp of when the underlying item was published/observed. */
  publishedAt: string;
  /** Headline, summary, or other short text. */
  text: string;
  /** Original URL if available (news article, post, etc.). */
  url?: string;
  /** Best-effort geographical hint. */
  region?: RawSignalRegionHint;
  /** Optional pre-extracted keywords/topics. */
  keywords?: string[];
};

/**
 * A pre-built snapshot returned by sources that already have structured
 * mood data (today: the mock adapter). Sources that only produce text
 * signals should leave this undefined.
 */
export type DataSourceSnapshot = {
  regions: RegionMood[];
  history: MoodHistoryPoint[];
};

export type DataSourceResult = {
  signals: RawSignal[];
  snapshot?: DataSourceSnapshot;
  /** Non-fatal warnings from this source (missing config, partial failure, etc.). */
  warnings: string[];
};

export type MoodDataSourceContext = {
  /** AbortSignal so callers can cancel long-running fetches. */
  signal?: AbortSignal;
};

/**
 * The interface every concrete data source implements. Keep it small so
 * adding a new source (RSS, GDELT, a database adapter, etc.) is a matter
 * of implementing two methods.
 */
export interface MoodDataSource {
  /** Stable identifier used in logs and the API response, e.g. "mock", "rss". */
  readonly id: string;
  /** Human-readable label for UI badges and dashboards. */
  readonly label: string;
  /** Quick check (sync or async) for whether this source can actually run. */
  isAvailable(): boolean | Promise<boolean>;
  /** Fetch the latest signals (and optionally a pre-built snapshot). */
  fetchSignals(context?: MoodDataSourceContext): Promise<DataSourceResult>;
}
