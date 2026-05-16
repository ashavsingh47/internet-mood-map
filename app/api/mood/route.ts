import {
  buildMoodSnapshot,
  resolveDataMode,
} from "@/lib/data-sources";
import {
  saveMoodSnapshot,
  shouldWriteSnapshots,
} from "@/lib/db/snapshots";
import type { MoodApiResponse } from "@/types/mood";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Allow callers to override the data source per request via ?mode=...
  // Falls back to the MOOD_DATA_MODE env var, then to "live-simulation".
  const url = new URL(request.url);
  const requestedMode = resolveDataMode(url.searchParams.get("mode"));

  try {
    const { payload } = await buildMoodSnapshot({
      requestedMode,
      signal: request.signal,
    });

    // Optional, opt-in snapshot persistence. Both gates must be open:
    //   - DATABASE_URL configured
    //   - ENABLE_SNAPSHOT_WRITES=true
    // Failures here NEVER break the response — they become warnings.
    if (shouldWriteSnapshots()) {
      const result = await saveMoodSnapshot(payload);
      if (!result.saved && result.warning) {
        payload.warnings = [...(payload.warnings ?? []), result.warning];
      }
    }

    return Response.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    // Last-resort safety net: even if the orchestrator throws, we still
    // return JSON so the dashboard's error UI can render something useful.
    const message =
      error instanceof Error ? error.message : "Unknown error";
    const failurePayload: MoodApiResponse = {
      status: "error",
      mode: "live-simulation",
      generatedAt: new Date().toISOString(),
      summary: {
        regionsSampled: 0,
        globalMood: "hopeful",
        averageMoodScore: 0,
        highActivityZones: 0,
      },
      regions: [],
      history: [],
      warnings: [`Mood pipeline failed: ${message}`],
    };

    return Response.json(failurePayload, {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
