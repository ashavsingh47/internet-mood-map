/**
 * Prisma seed entry point.
 *
 * Inserts (or updates) the 17 dashboard regions in the Region table so
 * any future MoodSnapshot rows have a valid parent row.
 *
 * Run with:
 *   npx prisma db seed
 * or:
 *   npm run prisma:seed
 *
 * Refuses to run without DATABASE_URL configured.
 */

import { seedRegions } from "../lib/db/snapshots";
import { isDatabaseConfigured } from "../lib/db/prisma";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error(
      "[seed] DATABASE_URL is not set. Add it to .env.local (or your shell) before seeding.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("[seed] Upserting 17 regions...");
  const result = await seedRegions();

  if (result.saved) {
    console.log("[seed] Done.");
  } else {
    console.error(`[seed] Failed: ${result.warning ?? "unknown error"}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[seed] Unhandled error:", error);
  process.exit(1);
});
