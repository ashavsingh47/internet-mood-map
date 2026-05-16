/**
 * Convert region-bucketed RawSignals into structured RegionMood objects.
 *
 * This is the glue between the data-source layer (signals) and the
 * dashboard layer (regions). It:
 *
 *   1. Looks up each region's static metadata (country/city/lat/lng) from
 *      the existing mock dataset so coordinates stay correct.
 *   2. Runs the rule-based NLP utility over all matched signal texts for
 *      that region to derive mood, moodScore, confidence, matched
 *      keywords, and signal count.
 *   3. Builds a plain-English explanation from those results (rule-based
 *      only; AI-generated explanations arrive in Phase 7).
 *   4. Derives activityLevel from how many signals the region attracted.
 *   5. Picks short trending topics from the matched keywords.
 */

import { mockMoodData } from "@/data/mockMoodData";
import { aggregateEmotionScores } from "@/lib/nlp/emotionScoring";
import { formatMoodLabel } from "@/lib/moodUtils";
import type { ActivityLevel, RegionMood } from "@/types/mood";
import type { MatchedSignal } from "./regionMatcher";

const REGION_TEMPLATES = new Map(
  mockMoodData.map((region) => [region.id, region]),
);

function deriveActivityLevel(signalCount: number): ActivityLevel {
  if (signalCount >= 4) return "high";
  if (signalCount >= 2) return "medium";
  return "low";
}

function uniqueTrendingTopics(
  matchedKeywords: readonly string[],
  fallback: readonly string[],
  max = 4,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const keyword of matchedKeywords) {
    const normalized = keyword.toLowerCase();
    if (!seen.has(normalized) && normalized.length > 1) {
      seen.add(normalized);
      result.push(keyword);
      if (result.length >= max) return result;
    }
  }

  // Top up from the mock region's existing topics if we don't have enough.
  for (const topic of fallback) {
    const normalized = topic.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(topic);
      if (result.length >= max) return result;
    }
  }

  return result;
}

function buildExplanation(args: {
  city: string;
  moodLabel: string;
  signalCount: number;
  topKeywords: string[];
}): string {
  const { city, moodLabel, signalCount, topKeywords } = args;

  if (signalCount === 0) {
    return `No recent news signals matched ${city} yet, so the mood reading is uncertain.`;
  }

  const articleWord = signalCount === 1 ? "headline" : "headlines";
  const keywordPart =
    topKeywords.length > 0
      ? ` Top recurring themes: ${topKeywords.slice(0, 4).join(", ")}.`
      : "";

  return (
    `${city} is reading ${moodLabel.toLowerCase()} based on ${signalCount} recent ` +
    `news ${articleWord} matched to this region.${keywordPart}`
  );
}

/**
 * Build a RegionMood for one region from its matched signals.
 *
 * Returns `null` when the region id is unknown (shouldn't happen since
 * the matcher only emits ids from the known set, but defensive nulls
 * keep the caller simple).
 */
export function buildRegionMoodFromSignals(
  regionId: string,
  matchedSignals: readonly MatchedSignal[],
): RegionMood | null {
  const template = REGION_TEMPLATES.get(regionId);
  if (!template) return null;

  const texts = matchedSignals.map((entry) => entry.signal.text);
  const aggregate = aggregateEmotionScores(texts);

  const trendingTopics = uniqueTrendingTopics(
    aggregate.matchedKeywords,
    template.trendingTopics,
  );

  const explanation = buildExplanation({
    city: template.city,
    moodLabel: formatMoodLabel(aggregate.mood),
    signalCount: aggregate.signalCount,
    topKeywords: aggregate.matchedKeywords,
  });

  return {
    id: template.id,
    country: template.country,
    city: template.city,
    lat: template.lat,
    lng: template.lng,
    mood: aggregate.mood,
    moodScore: aggregate.moodScore,
    activityLevel: deriveActivityLevel(aggregate.signalCount),
    trendingTopics,
    explanation,
    confidence: aggregate.confidence,
    matchedKeywords: aggregate.matchedKeywords,
    signalCount: aggregate.signalCount,
  };
}

/**
 * Build all real-derived regions from a flat list of matched signals.
 * Signals are grouped by region id internally so callers can hand in the
 * raw output of `matchSignalsToRegions`.
 */
export function buildRealRegions(
  matchedSignals: readonly MatchedSignal[],
): RegionMood[] {
  if (matchedSignals.length === 0) return [];

  const groups = new Map<string, MatchedSignal[]>();
  for (const entry of matchedSignals) {
    const existing = groups.get(entry.regionId);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.regionId, [entry]);
    }
  }

  const regions: RegionMood[] = [];
  for (const [regionId, group] of groups) {
    const region = buildRegionMoodFromSignals(regionId, group);
    if (region) regions.push(region);
  }

  return regions;
}
