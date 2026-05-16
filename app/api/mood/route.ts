import { applyAiExplanations } from "@/lib/ai";
import {
  buildMoodSnapshot,
  resolveDataMode,
} from "@/lib/data-sources";
import { getMoodHistoryFromSnapshots } from "@/lib/db/history";
import { isDatabaseConfigured } from "@/lib/db/prisma";
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

    // Optional AI explanations. When AI_EXPLANATION_PROVIDER + the
    // matching API key are configured we ask the provider for short,
    // hedged explanations per region. Any per-region failure falls
    // back to rule-based text so the dashboard never sees an empty
    // explanation field. Without env config this is a no-op that
    // simply marks `explanationSource: "rule-based"`.
    const aiResult = await applyAiExplanations(payload.regions, {
      sourceMode: payload.mode,
      signal: request.signal,
    });
    payload.regions = aiResult.regions;
    payload.explanationSource = aiResult.explanationSource;
    if (aiResult.warnings.length > 0) {
      payload.warnings = [
        ...(payload.warnings ?? []),
        ...aiResult.warnings,
      ];
    }

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

    // History defaults to "mock" (the bundled history that mock /
    // live-simulation already produced). If the database is configured
    // and has enough snapshots, we replace it with the reconstructed
    // DB-backed history. Failures fall back silently to mock.
    payload.historySource = "mock";
    if (isDatabaseConfigured()) {
      const dbHistory = await getMoodHistoryFromSnapshots();
      if (dbHistory.warning) {
        payload.warnings = [...(payload.warnings ?? []), dbHistory.warning];
      }
      if (dbHistory.history.length > 0) {
        payload.history = dbHistory.history;
        payload.historySource = "database";
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
      historySource: "mock",
      explanationSource: "rule-based",
    };

    return Response.json(failurePayload, {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
