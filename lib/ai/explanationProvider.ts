/**
 * Resolve the active AI explanation provider from env and apply it to
 * a list of regions.
 *
 * The whole module is engineered around "AI is optional":
 *   - resolveExplanationProvider() returns null when no provider is
 *     configured (or when it's configured incorrectly).
 *   - applyAiExplanations() degrades to per-region rule-based fallback
 *     for any failure, never throws to callers.
 */

import type { RegionMood } from "@/types/mood";
import {
  createGeminiExplanationProvider,
} from "./geminiExplanationProvider";
import {
  createOpenAiExplanationProvider,
} from "./openaiExplanationProvider";
import {
  generateRuleBasedExplanation,
  ruleBasedExplanationProvider,
} from "./ruleBasedExplanationProvider";
import type {
  ExplanationProvider,
  ExplanationProviderId,
  RegionExplanationInput,
} from "./types";

const DEFAULT_CONCURRENCY = 3;

export type ResolvedProvider = {
  provider: ExplanationProvider;
  /** Non-fatal warning if the env asked for a provider we couldn't build. */
  warning?: string;
};

/**
 * Read env vars and return an AI provider, or null when AI is disabled.
 *
 * Resolution rules:
 *   - AI_EXPLANATION_PROVIDER unset / "none" / unknown -> null (rule-based path).
 *   - "openai" -> use OpenAI only if OPENAI_API_KEY is non-empty.
 *   - "gemini" -> use Gemini only if GEMINI_API_KEY is non-empty.
 *   - Misconfiguration (provider chosen but no key) returns null + a warning.
 *
 * The function never throws — bad config becomes a soft fallback so
 * /api/mood keeps serving JSON.
 */
export function resolveExplanationProvider(): ResolvedProvider | null {
  const raw = (process.env.AI_EXPLANATION_PROVIDER ?? "").trim().toLowerCase();
  if (raw.length === 0 || raw === "none") return null;

  if (raw === "openai") {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return {
        provider: ruleBasedExplanationProvider,
        warning:
          "AI_EXPLANATION_PROVIDER=openai but OPENAI_API_KEY is missing; using rule-based explanations.",
      };
    }
    return {
      provider: createOpenAiExplanationProvider({
        apiKey,
        model: process.env.OPENAI_MODEL?.trim() || undefined,
      }),
    };
  }

  if (raw === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return {
        provider: ruleBasedExplanationProvider,
        warning:
          "AI_EXPLANATION_PROVIDER=gemini but GEMINI_API_KEY is missing; using rule-based explanations.",
      };
    }
    return {
      provider: createGeminiExplanationProvider({
        apiKey,
        model: process.env.GEMINI_MODEL?.trim() || undefined,
      }),
    };
  }

  return {
    provider: ruleBasedExplanationProvider,
    warning: `Unknown AI_EXPLANATION_PROVIDER="${raw}"; using rule-based explanations.`,
  };
}

function toInput(region: RegionMood, sourceMode: RegionMood["mood"] | string): RegionExplanationInput {
  return {
    city: region.city,
    country: region.country,
    mood: region.mood,
    moodScore: region.moodScore,
    confidence: region.confidence,
    signalCount: region.signalCount,
    trendingTopics: region.trendingTopics,
    matchedKeywords: region.matchedKeywords,
    // The orchestrator passes the response-level data source mode here.
    sourceMode: sourceMode as RegionExplanationInput["sourceMode"],
  };
}

async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function runOne(): Promise<void> {
    while (true) {
      const myIndex = cursor++;
      if (myIndex >= items.length) return;
      results[myIndex] = await worker(items[myIndex], myIndex);
    }
  }

  const workerCount = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workerCount }, runOne));
  return results;
}

export type ApplyAiExplanationsOptions = {
  /** Used to record `sourceMode` in the prompt. */
  sourceMode: RegionExplanationInput["sourceMode"];
  /** Max number of regions to process in parallel. */
  concurrency?: number;
  /** AbortSignal forwarded to provider calls. */
  signal?: AbortSignal;
};

export type ApplyAiExplanationsResult = {
  regions: RegionMood[];
  explanationSource: "rule-based" | "openai" | "gemini" | "mixed";
  warnings: string[];
};

/**
 * Replace each region's `explanation` with AI-generated text when a
 * provider is configured and the call succeeds. Per-region failures
 * fall back to rule-based text without aborting the whole batch.
 *
 * Returns a new regions array (does not mutate the input).
 */
export async function applyAiExplanations(
  regions: readonly RegionMood[],
  options: ApplyAiExplanationsOptions,
): Promise<ApplyAiExplanationsResult> {
  if (regions.length === 0) {
    return { regions: [], explanationSource: "rule-based", warnings: [] };
  }

  const resolved = resolveExplanationProvider();
  if (!resolved) {
    // No AI configured. Keep existing explanations as-is.
    return {
      regions: regions.map((region) => ({ ...region })),
      explanationSource: "rule-based",
      warnings: [],
    };
  }

  const warnings: string[] = [];
  if (resolved.warning) warnings.push(resolved.warning);

  const providerId = resolved.provider.id;
  if (providerId === "rule-based") {
    // Provider resolved to rule-based on purpose (misconfig path).
    return {
      regions: regions.map((region) => ({ ...region })),
      explanationSource: "rule-based",
      warnings,
    };
  }

  let aiSuccessCount = 0;
  let aiFailureCount = 0;

  const updated = await runWithConcurrency(
    regions,
    options.concurrency ?? DEFAULT_CONCURRENCY,
    async (region) => {
      const input = toInput(region, options.sourceMode);
      try {
        const explanation = await resolved.provider.explain(input, {
          signal: options.signal,
        });
        aiSuccessCount += 1;
        return { ...region, explanation };
      } catch (error) {
        aiFailureCount += 1;
        const message =
          error instanceof Error ? error.message : String(error);
        warnings.push(
          `[${resolved.provider.label}] ${region.city}: ${message}; using rule-based fallback.`,
        );
        // Rule-based fallback for this specific region only.
        return {
          ...region,
          explanation: generateRuleBasedExplanation(input),
        };
      }
    },
  );

  let explanationSource: ApplyAiExplanationsResult["explanationSource"];
  if (aiSuccessCount === 0) {
    explanationSource = "rule-based";
  } else if (aiFailureCount === 0) {
    explanationSource = providerId as Exclude<ExplanationProviderId, "rule-based">;
  } else {
    explanationSource = "mixed";
  }

  return { regions: updated, explanationSource, warnings };
}
