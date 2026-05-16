/**
 * Rule-based emotion scoring for the Internet Mood Map.
 *
 * Given a piece of text (a headline, a trending-topic blurb, an aggregated
 * region corpus, etc.) this module returns:
 *   - a single dominant mood
 *   - a 0-100 mood score (intensity, not direction)
 *   - a 0-1 confidence value
 *   - the keywords that drove the result
 *
 * Design goals:
 *   - Deterministic: no Math.random, no time-based behavior.
 *   - Cheap: pure string + regex work, runs in any environment.
 *   - Beginner-friendly: a dictionary of words per mood and simple counting.
 *
 * This is intentionally a *scoring* utility, not a sentiment analysis model.
 * It's good enough to demonstrate the pipeline and to react sensibly to the
 * kind of text we'll see in RSS headlines.
 */

import type { Mood } from "@/types/mood";

export type EmotionScore = {
  mood: Mood;
  /** 0-100. Higher means "the dominant mood is more strongly expressed". */
  moodScore: number;
  /** 0-1. Share of total keyword hits that belong to the winning mood. */
  confidence: number;
  /** Unique keywords from the winning mood that were found in the text. */
  matchedKeywords: string[];
};

export type AggregatedEmotionScore = EmotionScore & {
  /** Number of raw signals that contributed to this aggregate. */
  signalCount: number;
};

/**
 * Single-word keywords per mood. Kept short and curated rather than
 * exhaustive — easy to extend, easy to reason about. Each keyword is
 * matched as a whole word against the lowercased input (so "war" will
 * NOT match inside "warm").
 *
 * The same word may appear under multiple moods; both moods get a hit
 * and the strongest total wins.
 */
const EMOTION_DICTIONARIES: Record<Mood, readonly string[]> = {
  happy: [
    "happy", "joy", "joyful", "celebrate", "celebration", "win", "wins",
    "winning", "victory", "love", "loved", "great", "amazing", "wonderful",
    "smile", "smiling", "fun", "festival", "festivals", "delight",
    "delighted", "cheer", "cheers", "thrilled", "fantastic", "beautiful",
    "uplifting", "weekend", "music", "concert", "comedy", "feast",
  ],
  angry: [
    "angry", "anger", "furious", "outrage", "outraged", "rage", "hate",
    "hated", "protest", "protests", "fight", "fights", "attack", "attacks",
    "violence", "violent", "blame", "blamed", "criticize", "criticized",
    "criticism", "controversy", "scandal", "fired", "boycott", "feud",
    "lawsuit", "abuse", "corrupt", "corruption", "betrayed",
  ],
  sad: [
    "sad", "sadness", "grief", "mourn", "mourning", "loss", "tragedy",
    "tragic", "death", "died", "killed", "killing", "tears", "depressed",
    "depression", "sorrow", "lonely", "miss", "regret", "heartbreak",
    "heartbroken", "funeral", "obituary", "farewell", "victim", "victims",
  ],
  stressed: [
    "stress", "stressed", "pressure", "anxious", "anxiety", "worried",
    "worry", "panic", "exhausted", "burnout", "deadline", "deadlines",
    "crisis", "struggle", "struggling", "rent", "bills", "inflation",
    "layoff", "layoffs", "jobs", "housing", "mortgage", "shortage",
    "recession", "tax", "taxes", "expensive", "overworked", "commute",
    "traffic", "delays",
  ],
  excited: [
    "excited", "excitement", "thrilled", "amazing", "launch", "launches",
    "release", "released", "premiere", "premieres", "concert", "concerts",
    "event", "events", "viral", "trending", "hype", "championship",
    "tournament", "festival", "festivals", "movies", "movie", "anime",
    "k-pop", "kpop", "gaming", "game", "match", "match-up", "cricket",
    "football", "soccer", "basketball", "olympics", "sports",
  ],
  confused: [
    "confused", "confusion", "unclear", "uncertain", "uncertainty", "mixed",
    "questions", "ambiguous", "rumor", "rumors", "speculation", "debate",
    "debates", "discussion", "discussions", "wonder", "wondering",
    "puzzled", "complicated", "complex", "unsure",
  ],
  fearful: [
    "fear", "fears", "afraid", "scared", "terrified", "threat", "threats",
    "danger", "dangerous", "warning", "warnings", "evacuate", "evacuation",
    "outbreak", "disease", "pandemic", "war", "shooting", "shootings",
    "earthquake", "storm", "storms", "hurricane", "wildfire", "wildfires",
    "flood", "floods", "alert", "alerts", "emergency",
  ],
  hopeful: [
    "hope", "hopeful", "hopes", "optimistic", "optimism", "progress",
    "growth", "future", "promising", "rebound", "recovery", "breakthrough",
    "innovation", "innovative", "opportunity", "opportunities", "startup",
    "startups", "renew", "renewed", "improvement", "improvements", "rise",
    "rising", "boost", "uplift", "milestone", "milestones",
  ],
  chaotic: [
    "chaos", "chaotic", "disruption", "turmoil", "unrest", "riot", "riots",
    "clash", "clashes", "drama", "fiasco", "mayhem", "uproar", "explosion",
    "collapse", "controversy", "scandal", "shutdown", "blackout", "crash",
    "meltdown", "frenzy", "uproar",
  ],
};

const ALL_MOODS = Object.keys(EMOTION_DICTIONARIES) as Mood[];

/**
 * Lowercases, strips punctuation, collapses whitespace. The output is
 * a single string ready for whole-word regex matching.
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Count whole-word occurrences of `keyword` inside `normalizedText`.
 * Hyphenated keywords (like "k-pop") are matched literally.
 */
function countOccurrences(normalizedText: string, keyword: string): number {
  if (!keyword) return 0;
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(keyword)}(?![\\p{L}\\p{N}])`, "gu");
  const matches = normalizedText.match(pattern);
  return matches ? matches.length : 0;
}

export type MoodKeywordMatch = {
  mood: Mood;
  /** Unique keywords from this mood that appeared. */
  keywords: string[];
  /** Total occurrence count across all keywords for this mood. */
  hits: number;
};

/**
 * Walk every mood's dictionary and return per-mood hit counts.
 * Exposed so callers (and tests) can inspect the raw match table.
 */
export function extractMatchedKeywords(text: string): MoodKeywordMatch[] {
  const normalized = normalizeText(text);
  if (!normalized) {
    return ALL_MOODS.map((mood) => ({ mood, keywords: [], hits: 0 }));
  }

  return ALL_MOODS.map((mood) => {
    const dictionary = EMOTION_DICTIONARIES[mood];
    const keywords: string[] = [];
    let hits = 0;

    for (const word of dictionary) {
      const count = countOccurrences(normalized, word);
      if (count > 0) {
        keywords.push(word);
        hits += count;
      }
    }

    return { mood, keywords, hits };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Translate the winner's hit count into a 0-100 intensity score.
 *
 * The shape mirrors the existing mock data (most regions read 58-84):
 *   0 hits -> 45 (used only when nothing matched at all)
 *   1 hit  -> 56
 *   3 hits -> 68
 *   5 hits -> 80
 *   8+ hits -> 95 (capped)
 */
export function calculateMoodScore(topHits: number): number {
  if (topHits <= 0) return 45;
  return clamp(50 + topHits * 6, 50, 95);
}

/** Default response when input has zero useful signal. */
function emptyScore(): EmotionScore {
  return {
    mood: "confused",
    moodScore: 45,
    confidence: 0.1,
    matchedKeywords: [],
  };
}

/**
 * Score a single string against the mood dictionaries.
 *
 * Always returns a valid `EmotionScore` — falls back to a low-confidence
 * "confused" reading when no keywords are matched, so callers never have
 * to handle a null case.
 */
export function scoreEmotionFromText(input: string): EmotionScore {
  if (typeof input !== "string" || input.trim().length === 0) {
    return emptyScore();
  }

  const matches = extractMatchedKeywords(input);
  const totalHits = matches.reduce((sum, match) => sum + match.hits, 0);

  if (totalHits === 0) {
    return emptyScore();
  }

  // Pick the mood with the most hits; tie-break by alphabetical mood name
  // so the result is fully deterministic regardless of object iteration.
  const sorted = [...matches].sort((a, b) => {
    if (b.hits !== a.hits) return b.hits - a.hits;
    return a.mood.localeCompare(b.mood);
  });
  const winner = sorted[0];

  const moodScore = calculateMoodScore(winner.hits);
  const confidence = Math.round((winner.hits / totalHits) * 100) / 100;

  return {
    mood: winner.mood,
    moodScore,
    confidence,
    matchedKeywords: [...winner.keywords],
  };
}

/**
 * Score a bundle of texts together. Useful when several signals are
 * known to belong to the same region — concatenating them gives a more
 * stable read than scoring each in isolation.
 *
 * `signalCount` lets the UI show "based on N signals".
 */
export function aggregateEmotionScores(
  texts: readonly string[],
): AggregatedEmotionScore {
  if (texts.length === 0) {
    return { ...emptyScore(), signalCount: 0 };
  }

  const combined = texts.filter((value) => value && value.trim().length > 0).join(" \n ");
  const score = scoreEmotionFromText(combined);

  return { ...score, signalCount: texts.length };
}
