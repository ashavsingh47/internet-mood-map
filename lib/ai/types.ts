/**
 * Shared types for the optional AI explanation layer.
 *
 * Every concrete provider (OpenAI, Gemini, the rule-based fallback)
 * implements `ExplanationProvider`. Higher layers should treat the
 * providers as interchangeable — including treating a missing /
 * misconfigured AI provider as "use the rule-based one".
 */

import type { Mood, MoodDataMode } from "@/types/mood";

/**
 * The narrow slice of region data we pass to an explanation provider.
 * Intentionally small: AI providers must work from these facts alone
 * and should not hallucinate anything else.
 */
export type RegionExplanationInput = {
  city: string;
  country: string;
  mood: Mood;
  moodScore: number;
  confidence?: number;
  signalCount?: number;
  trendingTopics: string[];
  matchedKeywords?: string[];
  sourceMode: MoodDataMode;
};

export type ExplanationProviderId =
  | "rule-based"
  | "openai"
  | "gemini";

/**
 * The provider interface. `explain` MUST resolve to a non-empty,
 * post-sanitized string. Anything else (timeout, bad output, API error)
 * should be thrown so the orchestrator can fall back per-region.
 */
export interface ExplanationProvider {
  readonly id: ExplanationProviderId;
  readonly label: string;
  explain(
    input: RegionExplanationInput,
    options?: { signal?: AbortSignal },
  ): Promise<string>;
}

/**
 * Hard ceiling for an explanation, applied by every provider. Keeps
 * responses tweet-sized and chart-card friendly.
 */
export const MAX_EXPLANATION_CHARS = 280;

/** Default per-region call timeout. */
export const DEFAULT_AI_TIMEOUT_MS = 7000;

/**
 * Clean up raw model output: strip surrounding quotes / markdown,
 * collapse whitespace, and enforce the max character budget. Returns
 * `null` if the cleaned string is empty (caller should fall back).
 */
export function sanitizeExplanation(
  raw: unknown,
  maxChars: number = MAX_EXPLANATION_CHARS,
): string | null {
  if (typeof raw !== "string") return null;

  let text = raw.replace(/\r/g, " ").trim();
  // Strip surrounding quotes
  text = text.replace(/^["'`]+/, "").replace(/["'`]+$/, "");
  // Drop markdown emphasis markers
  text = text.replace(/\*\*?/g, "").replace(/__/g, "").replace(/^[-#>•]+\s*/, "");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (text.length === 0) return null;

  if (text.length > maxChars) {
    const slice = text.slice(0, maxChars - 1);
    const lastSentenceEnd = Math.max(
      slice.lastIndexOf("."),
      slice.lastIndexOf("!"),
      slice.lastIndexOf("?"),
    );
    if (lastSentenceEnd > maxChars * 0.5) {
      text = text.slice(0, lastSentenceEnd + 1);
    } else {
      text = `${slice.trimEnd()}…`;
    }
  }

  return text;
}
