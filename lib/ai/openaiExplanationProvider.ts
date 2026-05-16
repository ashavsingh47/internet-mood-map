/**
 * OpenAI Chat Completions explanation provider.
 *
 * Activated only when AI_EXPLANATION_PROVIDER=openai AND OPENAI_API_KEY
 * are both set. Falls back to rule-based for any region whose call
 * throws (handled by the orchestrator).
 *
 * Wire-protocol only — no SDK dependency. We hit /v1/chat/completions
 * directly with fetch() so the module works in any Node runtime
 * (including Vercel Edge if ever needed).
 */

import {
  DEFAULT_AI_TIMEOUT_MS,
  MAX_EXPLANATION_CHARS,
  sanitizeExplanation,
  type ExplanationProvider,
  type RegionExplanationInput,
} from "./types";
import { buildExplanationPrompt } from "./promptBuilder";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

type OpenAiChatChoice = { message?: { content?: unknown } };
type OpenAiChatResponse = { choices?: OpenAiChatChoice[] };

export type OpenAiExplanationProviderOptions = {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
};

export function createOpenAiExplanationProvider(
  options: OpenAiExplanationProviderOptions,
): ExplanationProvider {
  const apiKey = options.apiKey;
  const model = options.model ?? DEFAULT_OPENAI_MODEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_AI_TIMEOUT_MS;

  return {
    id: "openai",
    label: `OpenAI (${model})`,
    async explain(
      input: RegionExplanationInput,
      callOptions?: { signal?: AbortSignal },
    ): Promise<string> {
      const { system, user } = buildExplanationPrompt(input);

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
        const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            // ~70 tokens covers two short hedged sentences with margin.
            max_tokens: 120,
            temperature: 0.6,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `OpenAI HTTP ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as OpenAiChatResponse;
        const rawText = data.choices?.[0]?.message?.content;
        const cleaned = sanitizeExplanation(rawText, MAX_EXPLANATION_CHARS);
        if (!cleaned) {
          throw new Error("OpenAI returned empty or unusable content.");
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
