/**
 * Snapshot-backed mood history.
 *
 * The dashboard's history chart tracks five mood lines over time:
 * happy, stressed, excited, hopeful, chaotic. When the database is
 * configured and has enough MoodSnapshot rows, this module reconstructs
 * those five lines from real data. Otherwise it returns an empty array
 * and the API layer falls back to the bundled mock history.
 *
 * Like every helper in `lib/db/*`, this module is safe to call at any
 * time: missing config returns `{ history: [] }`, errors are caught and
 * surfaced as warning strings.
 */

import { getPrismaClient } from "./prisma";
import type { MoodHistoryPoint } from "@/types/mood";

/**
 * The five moods the chart can plot. Other mood categories produced by
 * the NLP layer (angry, sad, confused, fearful) are intentionally NOT
 * included here so the chart shape stays unchanged.
 */
const TRACKED_MOODS = [
  "happy",
  "stressed",
  "excited",
  "hopeful",
  "chaotic",
] as const;

type TrackedMood = (typeof TRACKED_MOODS)[number];

/**
 * When a bucket has zero snapshots for a given mood we still need a
 * numeric value for the chart. 35 reads as "below average / mostly
 * absent" without bottoming the line out at 0, which would visually
 * imply a real strong negative reading.
 */
const ABSENT_MOOD_BASELINE = 35;

export type GetMoodHistoryOptions = {
  /** How many time buckets (chart points) to return. Defaults to 6. */
  bucketCount?: number;
  /** Minimum buckets required before we trust the DB result. */
  minBuckets?: number;
};

export type GetMoodHistoryResult = {
  /** Empty when the DB isn't configured or doesn't have enough data. */
  history: MoodHistoryPoint[];
  /** Non-fatal warning when a DB query was attempted but failed. */
  warning?: string;
};

type SnapshotForHistory = {
  mood: string;
  moodScore: number;
  generatedAt: Date;
};

function averageScore(
  rows: readonly SnapshotForHistory[],
  mood: TrackedMood,
): number {
  let sum = 0;
  let count = 0;
  for (const row of rows) {
    if (row.mood === mood) {
      sum += row.moodScore;
      count += 1;
    }
  }
  if (count === 0) return ABSENT_MOOD_BASELINE;
  return Math.round(sum / count);
}

/**
 * Locale-independent "HH:MM" formatter in UTC. Keeps server-rendered
 * labels consistent regardless of the host's timezone.
 */
function formatBucketTime(date: Date): string {
  return date.toISOString().slice(11, 16);
}

/**
 * Build mood history points from saved MoodSnapshot rows.
 *
 * Algorithm:
 *   1. Pull the most recent snapshots ordered by `generatedAt` desc.
 *   2. Group rows by exact `generatedAt` timestamp — one bucket per
 *      `/api/mood` call, since every region snapshot from one request
 *      shares the same `generatedAt`.
 *   3. Keep the N most recent distinct buckets.
 *   4. If fewer buckets than `minBuckets`, return an empty array so the
 *      route can fall back to mock history.
 *   5. For each bucket, average the moodScore across regions per
 *      tracked mood. Moods that didn't appear in the bucket fall back
 *      to ABSENT_MOOD_BASELINE so the chart line is sensible.
 *   6. Return the buckets in chronological order (oldest first), which
 *      is the order Recharts expects.
 */
export async function getMoodHistoryFromSnapshots(
  options: GetMoodHistoryOptions = {},
): Promise<GetMoodHistoryResult> {
  const prisma = getPrismaClient();
  if (!prisma) return { history: [] };

  const bucketCount = options.bucketCount ?? 6;
  const minBuckets = options.minBuckets ?? 3;

  try {
    // Over-fetch so we can find `bucketCount` distinct timestamps even
    // when each call writes 17 rows (so 17 rows = 1 bucket).
    const rows = await prisma.moodSnapshot.findMany({
      orderBy: { generatedAt: "desc" },
      select: { mood: true, moodScore: true, generatedAt: true },
      take: bucketCount * 50,
    });

    if (rows.length === 0) return { history: [] };

    const buckets = new Map<string, SnapshotForHistory[]>();
    for (const row of rows) {
      const key = row.generatedAt.toISOString();
      const existing = buckets.get(key);
      if (existing) {
        existing.push(row);
      } else {
        buckets.set(key, [row]);
      }
    }

    // Most recent distinct buckets first; trim to bucketCount.
    const orderedBuckets = Array.from(buckets.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, bucketCount);

    if (orderedBuckets.length < minBuckets) {
      return { history: [] };
    }

    // Reverse so chart x-axis goes oldest -> newest, like mockMoodHistory.
    orderedBuckets.reverse();

    const history: MoodHistoryPoint[] = orderedBuckets.map(
      ([timestamp, rowsForBucket]) => ({
        time: formatBucketTime(new Date(timestamp)),
        happy: averageScore(rowsForBucket, "happy"),
        stressed: averageScore(rowsForBucket, "stressed"),
        excited: averageScore(rowsForBucket, "excited"),
        hopeful: averageScore(rowsForBucket, "hopeful"),
        chaotic: averageScore(rowsForBucket, "chaotic"),
      }),
    );

    return { history };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    return {
      history: [],
      warning: `Failed to read mood history from database: ${message}.`,
    };
  }
}
