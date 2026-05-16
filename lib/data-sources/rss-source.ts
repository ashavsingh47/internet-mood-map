import { parseFeed, type ParsedFeedItem } from "./rss-parser";
import type {
  DataSourceResult,
  MoodDataSource,
  MoodDataSourceContext,
  RawSignal,
} from "./types";

/** Hard cap on signals returned per request, to keep the API response bounded. */
const DEFAULT_MAX_SIGNALS = 50;
/** Per-feed network timeout. Public feeds are usually fast; this avoids hangs. */
const DEFAULT_FEED_TIMEOUT_MS = 6000;

/**
 * Read RSS_FEED_URLS from the environment.
 *
 * Comma-separated list of feed URLs. Whitespace and empty entries are
 * dropped. Empty / unset means "RSS source is not configured".
 */
export function getRssFeedUrls(): string[] {
  const raw = process.env.RSS_FEED_URLS ?? "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export type RssMoodDataSourceOptions = {
  /** Override env-based feed list (useful for tests). */
  feedUrls?: string[];
  /** Max signals returned in total across all feeds. Defaults to 50. */
  maxSignals?: number;
  /** Per-feed fetch timeout in milliseconds. Defaults to 6000ms. */
  perFeedTimeoutMs?: number;
};

type FetchedFeed = {
  url: string;
  items: ParsedFeedItem[];
};

async function fetchOneFeed(
  url: string,
  options: { timeoutMs: number; externalSignal?: AbortSignal },
): Promise<{ feed: FetchedFeed | null; warning?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  // Cascade caller's abort down to the per-feed controller.
  const externalAbortHandler = () => controller.abort();
  if (options.externalSignal) {
    if (options.externalSignal.aborted) {
      controller.abort();
    } else {
      options.externalSignal.addEventListener("abort", externalAbortHandler, {
        once: true,
      });
    }
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Some feeds reject the default fetch UA; identify ourselves politely.
        "User-Agent": "InternetMoodMap/1.0 (+https://internet-mood-map.vercel.app)",
        Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        feed: null,
        warning: `Feed ${url} returned HTTP ${response.status}.`,
      };
    }

    const xml = await response.text();
    const items = parseFeed(xml);

    if (items.length === 0) {
      return {
        feed: null,
        warning: `Feed ${url} returned no recognizable RSS/Atom items.`,
      };
    }

    return { feed: { url, items } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    return {
      feed: null,
      warning: `Feed ${url} failed: ${message}.`,
    };
  } finally {
    clearTimeout(timeoutId);
    if (options.externalSignal) {
      options.externalSignal.removeEventListener("abort", externalAbortHandler);
    }
  }
}

/**
 * Build a stable, source-prefixed signal id. Combining the feed URL with
 * the item's guid/link keeps duplicates out when multiple feeds republish
 * the same article.
 */
function buildSignalId(feedUrl: string, item: ParsedFeedItem): string {
  const baseId = item.guid ?? item.link ?? `${item.title}-${item.pubDate ?? ""}`;
  return `rss:${feedUrl}#${baseId}`;
}

function toRawSignal(feed: FetchedFeed, item: ParsedFeedItem): RawSignal {
  // Text we hand to NLP combines the headline and any short summary.
  const text = item.description
    ? `${item.title}. ${item.description}`
    : item.title;

  const publishedAt = item.pubDate
    ? safeIsoDate(item.pubDate)
    : new Date().toISOString();

  return {
    id: buildSignalId(feed.url, item),
    source: `rss:${feed.url}`,
    publishedAt,
    text,
    url: item.link,
  };
}

function safeIsoDate(input: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

/**
 * Real RSS data source.
 *
 * - Reads feed URLs from RSS_FEED_URLS (or constructor override).
 * - Fetches all feeds concurrently with per-feed timeouts.
 * - Per-feed failures become warnings; other feeds continue.
 * - Returns up to `maxSignals` RawSignal entries (oldest dropped first).
 * - Does NOT do NLP or region matching — that happens in the orchestrator.
 */
export class RssMoodDataSource implements MoodDataSource {
  readonly id = "rss";
  readonly label = "RSS News Signals";

  private readonly feedUrls: string[];
  private readonly maxSignals: number;
  private readonly perFeedTimeoutMs: number;

  constructor(options: RssMoodDataSourceOptions = {}) {
    this.feedUrls = options.feedUrls ?? getRssFeedUrls();
    this.maxSignals = options.maxSignals ?? DEFAULT_MAX_SIGNALS;
    this.perFeedTimeoutMs =
      options.perFeedTimeoutMs ?? DEFAULT_FEED_TIMEOUT_MS;
  }

  isAvailable(): boolean {
    return this.feedUrls.length > 0;
  }

  async fetchSignals(
    context?: MoodDataSourceContext,
  ): Promise<DataSourceResult> {
    if (this.feedUrls.length === 0) {
      return {
        signals: [],
        warnings: [
          "RSS adapter not configured: set RSS_FEED_URLS to a comma-separated list of feed URLs.",
        ],
      };
    }

    const warnings: string[] = [];

    const results = await Promise.all(
      this.feedUrls.map((url) =>
        fetchOneFeed(url, {
          timeoutMs: this.perFeedTimeoutMs,
          externalSignal: context?.signal,
        }),
      ),
    );

    const successfulFeeds: FetchedFeed[] = [];
    for (const result of results) {
      if (result.warning) warnings.push(result.warning);
      if (result.feed) successfulFeeds.push(result.feed);
    }

    if (successfulFeeds.length === 0) {
      warnings.push(
        "All configured RSS feeds failed; no real signals available.",
      );
      return { signals: [], warnings };
    }

    // Flatten into RawSignals, sort by recency, then cap.
    const signals: RawSignal[] = successfulFeeds.flatMap((feed) =>
      feed.items.map((item) => toRawSignal(feed, item)),
    );

    signals.sort((a, b) => {
      // Newest first — when we trim, we keep the freshest items.
      return b.publishedAt.localeCompare(a.publishedAt);
    });

    const trimmed = signals.slice(0, this.maxSignals);
    if (signals.length > trimmed.length) {
      warnings.push(
        `Received ${signals.length} signals; trimmed to the most recent ${trimmed.length}.`,
      );
    }

    return { signals: trimmed, warnings };
  }
}
