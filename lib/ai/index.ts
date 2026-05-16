export type {
  ExplanationProvider,
  ExplanationProviderId,
  RegionExplanationInput,
} from "./types";
export { sanitizeExplanation, MAX_EXPLANATION_CHARS } from "./types";

export {
  generateRuleBasedExplanation,
  ruleBasedExplanationProvider,
} from "./ruleBasedExplanationProvider";

export {
  createOpenAiExplanationProvider,
} from "./openaiExplanationProvider";
export type {
  OpenAiExplanationProviderOptions,
} from "./openaiExplanationProvider";

export {
  createGeminiExplanationProvider,
} from "./geminiExplanationProvider";
export type {
  GeminiExplanationProviderOptions,
} from "./geminiExplanationProvider";

export {
  applyAiExplanations,
  resolveExplanationProvider,
} from "./explanationProvider";
export type {
  ApplyAiExplanationsOptions,
  ApplyAiExplanationsResult,
  ResolvedProvider,
} from "./explanationProvider";

export { buildExplanationPrompt } from "./promptBuilder";
export type { ExplanationPrompt } from "./promptBuilder";
