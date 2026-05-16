/**
 * Shared mood domain types for the Internet Mood Map app.
 *
 * These types are the single source of truth for the shape of mood data
 * across the API route, the dashboard UI, and any future data sources or
 * database models. Importing from here (instead of from the mock data file)
 * keeps the domain model independent of any specific data source.
 */

export type Mood =
  | "happy"
  | "angry"
  | "sad"
  | "stressed"
  | "excited"
  | "confused"
  | "fearful"
  | "hopeful"
  | "chaotic";

export type ActivityLevel = "low" | "medium" | "high";

export type RegionMood = {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  mood: Mood;
  moodScore: number;
  activityLevel: ActivityLevel;
  trendingTopics: string[];
  explanation: string;
};

export type MoodHistoryPoint = {
  time: string;
  happy: number;
  stressed: number;
  excited: number;
  hopeful: number;
  chaotic: number;
};

export type MoodSummary = {
  regionsSampled: number;
  globalMood: Mood;
  averageMoodScore: number;
  highActivityZones: number;
};

/**
 * Modes used to describe how the data was sourced. This is informational
 * today (the MVP always uses the live-simulation path) but is wired through
 * so later phases can add hybrid/real data sources without changing the
 * response shape.
 */
export type MoodDataMode =
  | "mock"
  | "live-simulation"
  | "hybrid"
  | "real";

export type MoodApiResponse = {
  status: string;
  mode: MoodDataMode;
  generatedAt: string;
  summary: MoodSummary;
  regions: RegionMood[];
  history: MoodHistoryPoint[];
};
