/**
 * Optional database helpers for mood snapshots and trend topics.
 *
 * Every public function here is safe to call regardless of whether
 * DATABASE_URL is configured:
 *   - Mutations no-op silently when DB is missing.
 *   - Reads return empty arrays / null when DB is missing.
 *   - Errors are caught and reported as warning strings so the caller
 *     (typically /api/mood) can attach them to the API response without
 *     crashing the route.
 */

import { mockMoodData } from "@/data/mockMoodData";
import { getPrismaClient, isDatabaseConfigured } from "./prisma";
import type { MoodApiResponse, RegionMood } from "@/types/mood";

export type SaveSnapshotResult = {
  saved: boolean;
  /** Friendly message describing why a save was skipped or failed. */
  warning?: string;
};

export type RecentSnapshot = {
  id: string;
  regionId: string;
  mood: string;
  moodScore: number;
  confidence: number | null;
  signalCount: number | null;
  sourceMode: string;
  generatedAt: Date;
  topics: string[];
};

/**
 * Upsert the 17 regions from the bundled mock data so historical
 * snapshots have a parent Region row to attach to.
 *
 * Idempotent — safe to rerun. The seed script (`prisma/seed.ts`) is a
 * thin wrapper around this so the same logic can be invoked from the
 * Prisma CLI and from runtime if you ever want to bootstrap on demand.
 *
 * Returns `{ saved: false, warning }` when the DB is not configured.
 */
export async function seedRegions(): Promise<SaveSnapshotResult> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return {
      saved: false,
      warning: "Database not configured: skipped region seeding.",
    };
  }

  try {
    for (const region of mockMoodData) {
      await prisma.region.upsert({
        where: { id: region.id },
        create: {
          id: region.id,
          country: region.country,
          city: region.city,
          lat: region.lat,
          lng: region.lng,
        },
        update: {
          country: region.country,
          city: region.city,
          lat: region.lat,
          lng: region.lng,
        },
      });
    }
    return { saved: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      saved: false,
      warning: `Failed to seed regions: ${message}`,
    };
  }
}

/**
 * Persist every region in a MoodApiResponse as a fresh MoodSnapshot,
 * along with its trending topics. Uses a single transaction per region
 * so a partial failure on one region doesn't leave inconsistent data.
 *
 * The function tries to be helpful when called against an unseeded DB:
 * unknown region ids are skipped (with a warning) rather than crashing.
 */
export async function saveMoodSnapshot(
  response: MoodApiResponse,
): Promise<SaveSnapshotResult> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return {
      saved: false,
      warning: "Database not configured: snapshot not saved.",
    };
  }

  if (response.regions.length === 0) {
    return { saved: false, warning: "Snapshot has no regions; nothing to save." };
  }

  // Make sure the parent Region rows exist. This is cheap (upsert) and
  // means callers can wire `saveMoodSnapshot` without a separate seed step.
  const seedResult = await seedRegions();
  if (!seedResult.saved && seedResult.warning) {
    return { saved: false, warning: seedResult.warning };
  }

  const generatedAt = new Date(response.generatedAt);
  if (Number.isNaN(generatedAt.getTime())) {
    return {
      saved: false,
      warning: "Snapshot generatedAt was not a valid date.",
    };
  }

  try {
    for (const region of response.regions) {
      await saveRegionSnapshot(region, {
        sourceMode: response.mode,
        generatedAt,
      });
    }
    return { saved: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      saved: false,
      warning: `Failed to save mood snapshot: ${message}`,
    };
  }
}

async function saveRegionSnapshot(
  region: RegionMood,
  meta: { sourceMode: string; generatedAt: Date },
): Promise<void> {
  const prisma = getPrismaClient();
  if (!prisma) return;

  const topics = (region.matchedKeywords ?? region.trendingTopics ?? []).slice(
    0,
    8,
  );

  await prisma.moodSnapshot.create({
    data: {
      regionId: region.id,
      mood: region.mood,
      moodScore: region.moodScore,
      confidence: region.confidence ?? null,
      signalCount: region.signalCount ?? null,
      sourceMode: meta.sourceMode,
      generatedAt: meta.generatedAt,
      topics: {
        create: topics.map((topic) => ({
          regionId: region.id,
          topic,
        })),
      },
    },
  });
}

/**
 * Read the most recent MoodSnapshot rows, newest first.
 * Returns an empty array when the database is not configured.
 */
export async function getRecentMoodSnapshots(
  limit = 100,
): Promise<RecentSnapshot[]> {
  const prisma = getPrismaClient();
  if (!prisma) return [];

  try {
    const rows = await prisma.moodSnapshot.findMany({
      orderBy: { generatedAt: "desc" },
      take: Math.max(1, Math.min(limit, 500)),
      include: { topics: true },
    });

    return rows.map((row) => ({
      id: row.id,
      regionId: row.regionId,
      mood: row.mood,
      moodScore: row.moodScore,
      confidence: row.confidence,
      signalCount: row.signalCount,
      sourceMode: row.sourceMode,
      generatedAt: row.generatedAt,
      topics: row.topics.map((topic) => topic.topic),
    }));
  } catch (_error) {
    // Soft failure: callers can fall back to mock history.
    return [];
  }
}

/**
 * Should /api/mood persist a snapshot for this request?
 *
 * Two gates have to be open:
 *   1. The database must be configured.
 *   2. ENABLE_SNAPSHOT_WRITES must be explicitly set to "true".
 *
 * Both default to "no", so simply pointing DATABASE_URL at a Supabase
 * instance does NOT start writing on every request — you have to opt in.
 */
export function shouldWriteSnapshots(): boolean {
  if (!isDatabaseConfigured()) return false;
  const flag = process.env.ENABLE_SNAPSHOT_WRITES;
  return typeof flag === "string" && flag.trim().toLowerCase() === "true";
}
