/**
 * Google Gemini explanation provider.
 *
 * Activated only when AI_EXPLANATION_PROVIDER=gemini AND GEMINI_API_KEY
 * are both set. Falls back to rule-based for any region whose call
 * throws (handled by the orchestrator).
 *
 * Talks to the `v1beta:generateContent` endpoint via fetch() — no SDK
 * dependency. We concatenate the system and user prompts into a single
 * `text` part because the v1beta REST shape does not always honour a
 * dedicated `systemInstruction` across models.
 */

import {
  DEFAULT_AI_TIMEOUT_MS,
  MAX_EXPLANATION_CHARS,
  sanitizeExplanation,
  type ExplanationProvider,
  type RegionExplanationInput,
} from "./types";
import { buildExplanationPrompt } from "./promptBuilder";

const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiPart = { text?: unknown };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
type GeminiResponse = { candidates?: GeminiCandidate[] };

export type GeminiExplanationProviderOptions = {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
};

function buildEndpoint(model: string, apiKey: string): string {
  // Use URLSearchParams so we don't accidentally double-encode the key.
  const params = new URLSearchParams({ key: apiKey });
  return `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?${params.toString()}`;
}

export function createGeminiExplanationProvider(
  options: GeminiExplanationProviderOptions,
): ExplanationProvider {
  const apiKey = options.apiKey;
  const model = options.model ?? DEFAULT_GEMINI_MODEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_AI_TIMEOUT_MS;
  const endpoint = buildEndpoint(model, apiKey);

  return {
    id: "gemini",
    label: `Gemini (${model})`,
    async explain(
      input: RegionExplanationInput,
      callOptions?: { signal?: AbortSignal },
    ): Promise<string> {
      const { system, user } = buildExplanationPrompt(input);
      const combinedPrompt = `${system}\n\n---\n\n${user}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const externalAbort = () => controller.abort();
      if (callOptions?.signal) {
        if (callOptions.signal.aborted) controller.abort();
        else
          callOptions.signal.addEventListener("abort", externalAbort, {
            once: true,
          });
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: combinedPrompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 160,
              temperature: 0.6,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Gemini HTTP ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as GeminiResponse;
        const rawText = data.candidates?.[0]?.content?.parts
          ?.map((part) => (typeof part.text === "string" ? part.text : ""))
          .join(" ");

        const cleaned = sanitizeExplanation(rawText, MAX_EXPLANATION_CHARS);
        if (!cleaned) {
          throw new Error("Gemini returned empty or unusable content.");
        }
        return cleaned;
      } finally {
        clearTimeout(timeoutId);
        if (callOptions?.signal) {
          callOptions.signal.removeEventListener("abort", externalAbort);
        }
      }
    },
  };
}
