/**
 * Rule-based explanation provider.
 *
 * Deterministic, free, always available. Produces a 1-2 sentence
 * explanation using only the facts in `RegionExplanationInput`, with
 * hedged language so it reads honestly even when there's little signal.
 *
 * This is also the fallback used when an AI provider fails per-region.
 */

import { formatMoodLabel } from "@/lib/moodUtils";
import type { ExplanationProvider, RegionExplanationInput } from "./types";
import { sanitizeExplanation } from "./types";

function joinTopics(topics: readonly string[], max = 3): string {
  const cleaned = topics
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0)
    .slice(0, max);

  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
}

function describeIntensity(score: number): string {
  if (score >= 80) return "strongly";
  if (score >= 65) return "moderately";
  if (score >= 50) return "lightly";
  return "faintly";
}

/**
 * Build a hedged, plain-English explanation for one region.
 *
 * Examples:
 *   "Signals suggest Toronto is reading stressed, likely driven by
 *    housing, jobs, and weather."
 *   "Limited signal volume for Sydney; the listed topics (weather,
 *    cost of living) hint at a sad mood."
 */
export function generateRuleBasedExplanation(
  input: RegionExplanationInput,
): string {
  const moodLabel = formatMoodLabel(input.mood).toLowerCase();
  const intensity = describeIntensity(input.moodScore);
  const topicsList = joinTopics(input.trendingTopics);
  const keywordsList = joinTopics(input.matchedKeywords ?? [], 3);
  const signalCount = input.signalCount ?? 0;
  const lowSignal =
    typeof input.signalCount === "number" && input.signalCount <= 1;

  const driverPart =
    topicsList.length > 0
      ? `, likely driven by ${topicsList}`
      : keywordsList.length > 0
        ? `, with the listed keywords (${keywordsList}) suggesting the theme`
        : "";

  if (lowSignal) {
    const topicsHint =
      topicsList.length > 0
        ? ` (${topicsList})`
        : keywordsList.length > 0
          ? ` (${keywordsList})`
          : "";
    return `Limited signal volume for ${input.city}; the listed topics${topicsHint} hint at a ${moodLabel} mood.`;
  }

  const signalsHint =
    signalCount > 1 ? ` based on ${signalCount} recent signals` : "";

  const sentence = `Signals suggest ${input.city} is reading ${moodLabel} ${intensity}${signalsHint}${driverPart}.`;
  return sanitizeExplanation(sentence) ?? sentence;
}

export const ruleBasedExplanationProvider: ExplanationProvider = {
  id: "rule-based",
  label: "Rule-based",
  async explain(input: RegionExplanationInput): Promise<string> {
    return generateRuleBasedExplanation(input);
  },
};
