/**
 * Shared prompt construction for AI explanation providers.
 *
 * Both the OpenAI and Gemini providers feed exactly the same facts to
 * the model so explanations stay comparable across providers.
 * Keeping this in one place also gives us one spot to tighten the
 * "don't hallucinate" guardrails over time.
 */

import type { RegionExplanationInput } from "./types";

export type ExplanationPrompt = {
  system: string;
  user: string;
};

const SYSTEM_PROMPT = `You write one short, plain-English mood explanation for a region in the "Internet Mood Map" dashboard.

Strict rules:
- Output 1 to 2 sentences. No markdown. No quotes around the response.
- Keep the response under 280 characters total.
- Use ONLY the facts the user provides. Do NOT invent specific events, news headlines, names, dates, or numbers.
- Phrase with hedged language: "signals suggest", "the mood is likely driven by", "based on the listed topics".
- Do not claim certainty. Do not name unavailable facts.
- Mention the city by name.`;

function trim<T>(values: readonly T[], max: number): T[] {
  return values.slice(0, Math.max(0, max));
}

export function buildExplanationPrompt(
  input: RegionExplanationInput,
): ExplanationPrompt {
  const lines: string[] = [
    `Region: ${input.city}, ${input.country}`,
    `Mood: ${input.mood} (score ${input.moodScore}/100)`,
  ];

  if (input.trendingTopics.length > 0) {
    lines.push(
      `Trending topics: ${trim(input.trendingTopics, 6).join(", ")}`,
    );
  }

  if (input.matchedKeywords && input.matchedKeywords.length > 0) {
    lines.push(
      `Matched keywords: ${trim(input.matchedKeywords, 6).join(", ")}`,
    );
  }

  if (typeof input.signalCount === "number") {
    lines.push(`Signal count: ${input.signalCount}`);
  }

  if (typeof input.confidence === "number") {
    lines.push(`Confidence: ${input.confidence.toFixed(2)} (0-1 scale)`);
  }

  lines.push(`Data source mode: ${input.sourceMode}`);
  lines.push("");
  lines.push("Write one short explanation now.");

  return {
    system: SYSTEM_PROMPT,
    user: lines.join("\n"),
  };
}
