import type {
  DataSourceResult,
  MoodDataSource,
  MoodDataSourceContext,
} from "./types";

/**
 * Reads RSS_FEED_URLS from the environment.
 *
 * The value is a comma-separated list of feed URLs. Empty / unset means
 * "RSS source is not configured", and the orchestrator will fall back to
 * mock data with a warning.
 */
export function getRssFeedUrls(): string[] {
  const raw = process.env.RSS_FEED_URLS ?? "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

/**
 * Scaffold RSS adapter.
 *
 * Phase 2 only wires up the interface and configuration. Phase 4 will
 * implement actual fetching + parsing (using a small RSS parser, no API
 * keys, no scraping). Until then `fetchSignals()` returns an empty
 * signal list and an honest warning so the API layer can decide whether
 * to fall back to mock data.
 */
export class RssMoodDataSource implements MoodDataSource {
  readonly id = "rss";
  readonly label = "RSS News Signals";

  isAvailable(): boolean {
    return getRssFeedUrls().length > 0;
  }

  async fetchSignals(_context?: MoodDataSourceContext): Promise<DataSourceResult> {
    const feeds = getRssFeedUrls();

    if (feeds.length === 0) {
      return {
        signals: [],
        warnings: [
          "RSS adapter not configured: set RSS_FEED_URLS to a comma-separated list of feed URLs.",
        ],
      };
    }

    return {
      signals: [],
      warnings: [
        `RSS adapter scaffold ready (${feeds.length} feed(s) configured). Real fetching arrives in Phase 4; using fallback for now.`,
      ],
    };
  }
}
