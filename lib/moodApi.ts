import type { MoodApiResponse } from "@/types/mood";

/**
 * Default endpoint for the mood API. Kept as a constant so callers
 * (dashboard, future server components, tests) all hit the same path.
 */
export const MOOD_API_PATH = "/api/mood";

export type FetchMoodDataOptions = {
  /** Optional AbortSignal so the dashboard can cancel in-flight refreshes. */
  signal?: AbortSignal;
  /**
   * Override the endpoint. Mostly useful for tests; production should use
   * the default `/api/mood` route.
   */
  endpoint?: string;
};

/**
 * Fetches the current mood snapshot from the Next.js API route.
 *
 * Centralizing this call gives us one place to:
 *   - set the no-store cache policy (we always want fresh signals)
 *   - shape errors consistently for the dashboard
 *   - swap in new data-source modes later (hybrid / real)
 *
 * Throws an Error with a friendly message if the network or response fails,
 * so callers can surface it directly to the user.
 */
export async function fetchMoodData(
  options: FetchMoodDataOptions = {},
): Promise<MoodApiResponse> {
  const { signal, endpoint = MOOD_API_PATH } = options;

  const response = await fetch(endpoint, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load mood data (status ${response.status}).`,
    );
  }

  const data = (await response.json()) as MoodApiResponse;

  return data;
}
