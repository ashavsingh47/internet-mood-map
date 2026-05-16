/**
 * Optional Prisma client wrapper.
 *
 * The whole app is designed to run with NO database. Code paths that
 * touch the DB must:
 *
 *   1. Call `isDatabaseConfigured()` first.
 *   2. Get the client via `getPrismaClient()` — never `new PrismaClient()`
 *      directly. This keeps a single shared instance across hot-reloads
 *      in Next.js dev mode and avoids exhausting connection pools.
 *   3. Treat any thrown error as a soft failure: log and continue.
 *
 * `getPrismaClient()` returns `null` when the database isn't configured,
 * so call sites end up with a uniform pattern:
 *
 *     const prisma = getPrismaClient();
 *     if (!prisma) return; // no-op without a DB
 *     await prisma.region.findMany();
 */

import { PrismaClient } from "@prisma/client";

type PrismaGlobal = typeof globalThis & {
  __internetMoodMapPrisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

/**
 * Returns true when DATABASE_URL is set (non-empty). This is the single
 * gate everything else in `lib/db/*` checks before doing any work.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return typeof url === "string" && url.trim().length > 0;
}

/**
 * Lazy singleton Prisma client. Returns `null` when DATABASE_URL is not
 * configured so callers never have to wrap this in their own try/catch
 * just to get the env check right.
 */
export function getPrismaClient(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;

  if (!globalForPrisma.__internetMoodMapPrisma) {
    globalForPrisma.__internetMoodMapPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    });
  }

  return globalForPrisma.__internetMoodMapPrisma;
}
