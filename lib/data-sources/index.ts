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

export { RssMoodDataSource, getRssFeedUrls } from "./rss-source";

export {
  buildMoodSnapshot,
  resolveDataMode,
} from "./orchestrator";
export type {
  BuildMoodSnapshotOptions,
  BuildMoodSnapshotResult,
} from "./orchestrator";
