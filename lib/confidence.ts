/**
 * Helpers for displaying NLP confidence values on the dashboard.
 *
 * All helpers are tolerant of `undefined` / `null` since the underlying
 * field is optional on `RegionMood`.
 */

export type ConfidenceTier = "Low" | "Medium" | "High";

export function formatConfidence(confidence?: number | null): string {
  if (typeof confidence !== "number" || Number.isNaN(confidence)) {
    return "—";
  }
  const pct = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
  return `${pct}%`;
}

export function getConfidenceTier(confidence?: number | null): ConfidenceTier {
  if (typeof confidence !== "number" || Number.isNaN(confidence)) {
    return "Low";
  }
  if (confidence >= 0.7) return "High";
  if (confidence >= 0.4) return "Medium";
  return "Low";
}

/**
 * Tailwind utility classes for the small confidence pill / chip.
 * Matches the existing moodStyles palette so the dashboard stays
 * visually cohesive.
 */
export function getConfidenceClassName(confidence?: number | null): string {
  const tier = getConfidenceTier(confidence);
  if (tier === "High") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }
  if (tier === "Medium") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }
  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}
