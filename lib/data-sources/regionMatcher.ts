/**
 * Region matcher.
 *
 * Given the free text of a news/RSS signal, find which of the dashboard's
 * 17 regions it most likely belongs to. The matcher is intentionally
 * conservative:
 *
 *   - Strong keywords (city names, neighborhoods, well-known nicknames)
 *     win over weak keywords (country names) so a "United States" headline
 *     doesn't get force-fitted into the New York bucket when "Los Angeles"
 *     would have been a better match.
 *   - A signal that doesn't match any keyword is dropped (not invented).
 *   - Matching is case-insensitive and uses whole-word boundaries, so
 *     "uk" does NOT match inside "junkyard" and "Paris" does NOT match
 *     inside "Parisian-style" (still acceptable — substring noise is the
 *     real worry, and \b handles that).
 *
 * The keyword lists below stay close to the 17 mock regions; extending
 * them later is just a matter of adding more strings.
 */

import type { RawSignal } from "./types";

type RegionMatcherEntry = {
  regionId: string;
  /** Strong keywords: must clearly identify this region. */
  strong: string[];
  /** Weak keywords: country / large-area names. Used only if no strong hits. */
  weak: string[];
};

const REGION_MATCHERS: readonly RegionMatcherEntry[] = [
  {
    regionId: "canada-toronto",
    strong: ["toronto", "gta"],
    weak: ["canada", "ontario"],
  },
  {
    regionId: "usa-new-york",
    strong: [
      "new york",
      "new york city",
      "nyc",
      "manhattan",
      "brooklyn",
      "queens",
      "bronx",
    ],
    weak: ["united states", "u.s.", "america", "usa"],
  },
  {
    regionId: "usa-los-angeles",
    strong: [
      "los angeles",
      "l.a.",
      "hollywood",
      "santa monica",
      "burbank",
      "california",
    ],
    weak: [],
  },
  {
    regionId: "mexico-mexico-city",
    strong: ["mexico city", "cdmx"],
    weak: ["mexico"],
  },
  {
    regionId: "brazil-sao-paulo",
    strong: ["sao paulo", "são paulo", "sampa"],
    weak: ["brazil", "brasil"],
  },
  {
    regionId: "uk-london",
    strong: ["london", "westminster"],
    weak: ["united kingdom", "britain", "uk", "england"],
  },
  {
    regionId: "france-paris",
    strong: ["paris"],
    weak: ["france"],
  },
  {
    regionId: "germany-berlin",
    strong: ["berlin"],
    weak: ["germany", "deutschland"],
  },
  {
    regionId: "turkey-istanbul",
    strong: ["istanbul"],
    weak: ["turkey", "türkiye", "turkiye"],
  },
  {
    regionId: "nigeria-lagos",
    strong: ["lagos"],
    weak: ["nigeria"],
  },
  {
    regionId: "south-africa-cape-town",
    strong: ["cape town"],
    weak: ["south africa"],
  },
  {
    regionId: "uae-dubai",
    strong: ["dubai"],
    weak: ["united arab emirates", "uae", "abu dhabi"],
  },
  {
    regionId: "india-delhi",
    strong: ["delhi", "new delhi"],
    weak: ["india"],
  },
  {
    regionId: "singapore-singapore",
    strong: ["singapore"],
    weak: [],
  },
  {
    regionId: "south-korea-seoul",
    strong: ["seoul"],
    weak: ["south korea", "korea"],
  },
  {
    regionId: "japan-tokyo",
    strong: ["tokyo"],
    weak: ["japan"],
  },
  {
    regionId: "australia-sydney",
    strong: ["sydney"],
    weak: ["australia"],
  },
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word, case-insensitive presence check. */
function containsKeyword(haystack: string, keyword: string): boolean {
  if (!keyword) return false;
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegex(keyword)}(?![\\p{L}\\p{N}])`,
    "iu",
  );
  return pattern.test(haystack);
}

export type MatchedSignal = {
  regionId: string;
  signal: RawSignal;
  /** "strong" = city-level evidence, "weak" = country-only. */
  strength: "strong" | "weak";
};

export type RegionMatchResult = {
  matched: MatchedSignal[];
  /** Signals that did not match any region. */
  unmatched: RawSignal[];
};

/**
 * Match a single text blob to the best region (if any).
 *
 * Returns `null` when nothing matches. Strong matches take absolute
 * priority over weak matches, so "Los Angeles wildfires across
 * California" beats a weaker generic "United States" weak match.
 */
export function findRegionForText(text: string): {
  regionId: string;
  strength: "strong" | "weak";
} | null {
  if (typeof text !== "string" || text.length === 0) return null;

  // First pass: strong (city) keywords. Stop at the first hit.
  for (const entry of REGION_MATCHERS) {
    for (const keyword of entry.strong) {
      if (containsKeyword(text, keyword)) {
        return { regionId: entry.regionId, strength: "strong" };
      }
    }
  }

  // Second pass: weak (country) keywords.
  for (const entry of REGION_MATCHERS) {
    for (const keyword of entry.weak) {
      if (containsKeyword(text, keyword)) {
        return { regionId: entry.regionId, strength: "weak" };
      }
    }
  }

  return null;
}

/**
 * Walk every signal and bucket it onto a region (when possible).
 * Order of input signals is preserved within each region.
 */
export function matchSignalsToRegions(
  signals: readonly RawSignal[],
): RegionMatchResult {
  const matched: MatchedSignal[] = [];
  const unmatched: RawSignal[] = [];

  for (const signal of signals) {
    const haystack = [signal.text, signal.url ?? "", (signal.keywords ?? []).join(" ")].join(" ");
    const match = findRegionForText(haystack);
    if (match) {
      matched.push({
        regionId: match.regionId,
        signal,
        strength: match.strength,
      });
    } else {
      unmatched.push(signal);
    }
  }

  return { matched, unmatched };
}

/** Useful for tests and the orchestrator's source summary. */
export function getKnownRegionIds(): string[] {
  return REGION_MATCHERS.map((entry) => entry.regionId);
}
