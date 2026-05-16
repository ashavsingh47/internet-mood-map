export type {
  DataSourceResult,
  DataSourceSnapshot,
  MoodDataSource,
  MoodDataSourceContext,
  RawSignal,
  RawSignalRegionHint,
} from "./types";

export { MockMoodDataSource } from "./mock-source";
export type { MockMoodDataSourceOptions } from "./mock-source";

export {
  RssMoodDataSource,
  getRssFeedUrls,
} from "./rss-source";
export type { RssMoodDataSourceOptions } from "./rss-source";

export { parseFeed } from "./rss-parser";
export type { ParsedFeedItem } from "./rss-parser";

export {
  findRegionForText,
  getKnownRegionIds,
  matchSignalsToRegions,
} from "./regionMatcher";
export type { MatchedSignal, RegionMatchResult } from "./regionMatcher";

export {
  buildRealRegions,
  buildRegionMoodFromSignals,
} from "./realRegionBuilder";

export {
  buildMoodSnapshot,
  resolveDataMode,
} from "./orchestrator";
export type {
  BuildMoodSnapshotOptions,
  BuildMoodSnapshotResult,
} from "./orchestrator";
