# Internet Mood Map

A full-stack portfolio web app that visualizes how the internet feels across the world in real time — powered by an API-driven dashboard, interactive Leaflet map, rule-based NLP emotion scoring, optional RSS news integration, optional Supabase/PostgreSQL database, and optional AI-generated regional explanations.

The project works out of the box with zero environment variables using a realistic live-simulation mode, and scales up to semi-real data when RSS feeds and AI providers are configured.

---

## Key Highlights

- Interactive global mood map with pulsing markers across 17 regions
- API-powered dashboard using `GET /api/mood`
- Four data modes: mock, live-simulation, hybrid, real
- Rule-based NLP emotion scoring (no paid APIs required)
- Optional RSS/news signal ingestion with region matching
- Optional Supabase / PostgreSQL snapshot storage via Prisma
- Optional AI-generated regional explanations (OpenAI or Gemini)
- Dashboard surfaces: data mode, history source, explanation source, NLP confidence, matched keywords, warnings
- Manual refresh, auto-refresh every 30 seconds
- Search and filter by country, city, mood, and topic
- Top mood spike detection
- Mood history chart (mock fallback → real DB snapshots when configured)
- Responsive, futuristic dark dashboard UI

---

## Live Demo

Live site: https://internet-mood-map.vercel.app/

Dashboard: https://internet-mood-map.vercel.app/dashboard

API route: https://internet-mood-map.vercel.app/api/mood

---

## Preview

### Landing Page

![Internet Mood Map landing page](public/screenshots/landing-page.png)

### Dashboard

![Internet Mood Map dashboard](public/screenshots/dashboard.png)

### Mobile Dashboard

![Internet Mood Map mobile dashboard](public/screenshots/mobile-dashboard.png)

---

## Core Idea

The internet produces emotional signals constantly through news, sports, politics, entertainment, and global events. Internet Mood Map turns those signals into a visual dashboard where you can explore:

- what different regions are feeling right now
- which topics are trending and driving sentiment
- where emotional spikes are happening
- how mood changes over time
- why a region may be showing a certain emotional pattern

The default mode uses realistic simulated data so the dashboard always works without external APIs. When RSS feeds, a database, or AI keys are configured, the same pipeline upgrades automatically.

---

## Features

### Interactive Global Mood Map

- Leaflet world map with custom pulsing mood markers
- Marker color represents the dominant emotion for each region
- Clicking a marker updates the Region Insight panel
- Map responds to search and mood filter in real time

### Region Mood Intelligence

Each region exposes:

- country, city, latitude/longitude
- mood category and mood score (0–100)
- activity level (low / medium / high)
- trending topics
- NLP confidence score (when available)
- matched signal keywords (when available)
- signal count driving the reading (when available)
- explanation text (rule-based by default, optional AI-generated)

### Mood Categories

Nine emotional states are supported:

`happy` · `angry` · `sad` · `stressed` · `excited` · `confused` · `fearful` · `hopeful` · `chaotic`

### Dashboard Metadata Badges

A compact strip below the header always shows:

- **Mode** — Mock / Live Simulation / Hybrid / Real
- **History** — Mock or Database
- **Explanation** — Rule-based / OpenAI / Gemini / Mixed

When hybrid or real mode produces source summary data, it also shows: `Sources · Signals · Matched · Unmatched`.

### Warnings Panel

If any data-source step falls back or partially fails, a collapsible amber warnings panel appears in the dashboard. It is advisory only — the dashboard never breaks because of backend fallbacks.

### Search and Filtering

Search across country, city, mood, and trending topic simultaneously. Filter by mood category. Reset with one click.

### Top Mood Spikes

The dashboard ranks the regions with the strongest emotional intensity scores at the current moment.

### Mood History Chart

A Recharts line chart tracks five moods over time: happy, stressed, excited, hopeful, chaotic. Sources:

- **Mock** — bundled simulated history with optional live drift.
- **Database** — reconstructed from saved MoodSnapshot rows when the database is configured and enough snapshots exist.

### API-Powered Data Flow

The dashboard fetches fresh data from `GET /api/mood` on every refresh. The response shape is stable across all modes.

### Refresh Controls

- Manual "Refresh Signals" button
- Auto-refresh toggle (every 30 seconds)
- API-generated timestamp visible on the map panel

---

## Data Modes

The `/api/mood` route supports four modes, controllable via the `MOOD_DATA_MODE` environment variable or a `?mode=` query parameter per request.

### `mock`

Deterministic bundled data. Scores never drift between calls. Useful for screenshots, tests, and demos where stable numbers matter.

```
GET /api/mood?mode=mock
```

### `live-simulation` (default)

Bundled mock data with small random score drift applied on each call — mimicking the feel of live signals without requiring any external APIs. This is the default when no environment variable is set.

```
GET /api/mood?mode=live-simulation
```

### `hybrid`

Attempts to fetch real signals from configured RSS feeds first. For regions where matched signals exist, real-derived mood data is used. For regions without matched signals, live-simulation data fills the gap. Always returns all 17 map markers.

Falls back to live-simulation for the whole response if RSS is not configured or fails, with a warning in the response.

```
GET /api/mood?mode=hybrid
```

### `real`

Returns only regions where real RSS signals were matched. May return fewer than 17 regions depending on news coverage. Falls back to live-simulation with a warning if no usable signals are available.

```
GET /api/mood?mode=real
```

> **Note**: RSS integration is semi-real data (public news headlines, keyword-based region matching, rule-based NLP scoring). It is not live social-media ingestion and does not scrape any websites.

---

## API Response Overview

`GET /api/mood` returns JSON with the following fields:

| Field | Type | Description |
|---|---|---|
| `status` | `string` | `"success"` or `"error"` |
| `mode` | `string` | Active data mode (`mock`, `live-simulation`, `hybrid`, `real`) |
| `generatedAt` | `string` | ISO 8601 timestamp of this response |
| `summary` | `object` | `regionsSampled`, `globalMood`, `averageMoodScore`, `highActivityZones` |
| `regions` | `array` | Array of `RegionMood` objects (see below) |
| `history` | `array` | `MoodHistoryPoint[]` for the chart |
| `warnings` | `string[]` | Optional. Non-fatal fallback messages |
| `sourceSummary` | `object` | Optional. `sourceCount`, `signalCount`, `matchedSignalCount`, `unmatchedSignalCount` — present in hybrid/real modes |
| `historySource` | `string` | `"mock"` or `"database"` |
| `explanationSource` | `string` | `"rule-based"`, `"openai"`, `"gemini"`, or `"mixed"` |

Each `RegionMood` object includes: `id`, `country`, `city`, `lat`, `lng`, `mood`, `moodScore`, `activityLevel`, `trendingTopics`, `explanation`, and optionally `confidence`, `matchedKeywords`, `signalCount`.

---

## Architecture

```
Dashboard (React / Next.js App Router)
  │
  │  fetchMoodData()  →  GET /api/mood
  │
  └─▶ /api/mood route  (Next.js Route Handler, force-dynamic)
        │
        ├─▶ resolveDataMode()          read ?mode= or MOOD_DATA_MODE env
        │
        ├─▶ buildMoodSnapshot()        data source orchestrator
        │     ├── mock                 bundled 17-region dataset
        │     ├── live-simulation      mock + random score drift
        │     ├── hybrid               RSS → region matcher → real regions
        │     │                        + mock fill for unmatched regions
        │     └── real                 RSS → region matcher → real regions only
        │
        ├─▶ NLP scoring               rule-based keyword dictionaries
        │   (enriches each region with confidence, matchedKeywords, signalCount)
        │
        ├─▶ applyAiExplanations()      optional  (AI_EXPLANATION_PROVIDER)
        │   ├── OpenAI Chat Completions
        │   ├── Google Gemini
        │   └── rule-based fallback (per-region on failure)
        │
        ├─▶ saveMoodSnapshot()         optional  (ENABLE_SNAPSHOT_WRITES)
        │   └── Prisma → PostgreSQL / Supabase
        │
        ├─▶ getMoodHistoryFromSnapshots()  optional  (DATABASE_URL)
        │   └── replaces mock history when ≥ 3 DB buckets exist
        │
        └─▶ MoodApiResponse JSON  →  Dashboard updates
```

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Map | Leaflet + React Leaflet |
| Charts | Recharts |
| NLP | Custom rule-based keyword scoring (zero dependencies) |
| XML Parsing | Custom zero-dependency RSS/Atom parser |
| Database ORM | Prisma 6 (optional) |
| Database | PostgreSQL / Supabase (optional) |
| API Layer | Next.js Route Handlers |
| AI Providers | OpenAI Chat Completions, Google Gemini (both optional, fetch-based) |
| Deployment | Vercel |
| Version Control | Git + GitHub |

---

## Project Structure

```
internet-mood-map/
│
├── app/
│   ├── api/mood/route.ts        Main API route
│   ├── dashboard/page.tsx       Dashboard page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 Landing page
│
├── components/
│   ├── Dashboard/
│   │   ├── DataSourceStatus.tsx  Mode/history/explanation badges + warnings
│   │   ├── LiveStatus.tsx
│   │   ├── MoodHistoryChart.tsx
│   │   ├── RegionCard.tsx
│   │   ├── RegionFilters.tsx
│   │   ├── RegionInsight.tsx     Confidence, signals, matched keywords
│   │   ├── StatCard.tsx
│   │   └── TopMoodSpikes.tsx
│   └── Map/
│       ├── MoodLegend.tsx
│       ├── MoodMap.tsx
│       └── MoodMapWrapper.tsx
│
├── data/
│   └── mockMoodData.ts          17-region bundled dataset
│
├── lib/
│   ├── ai/                      Optional AI explanation providers
│   │   ├── explanationProvider.ts
│   │   ├── geminiExplanationProvider.ts
│   │   ├── openaiExplanationProvider.ts
│   │   ├── promptBuilder.ts
│   │   ├── ruleBasedExplanationProvider.ts
│   │   └── types.ts
│   ├── data-sources/            Data source orchestration
│   │   ├── mock-source.ts
│   │   ├── orchestrator.ts
│   │   ├── realRegionBuilder.ts
│   │   ├── regionMatcher.ts
│   │   ├── rss-parser.ts
│   │   ├── rss-source.ts
│   │   └── types.ts
│   ├── db/                      Optional database helpers
│   │   ├── history.ts
│   │   ├── prisma.ts
│   │   └── snapshots.ts
│   ├── nlp/
│   │   └── emotionScoring.ts    Rule-based NLP scorer
│   ├── confidence.ts
│   ├── moodApi.ts
│   ├── moodStyles.ts
│   └── moodUtils.ts
│
├── prisma/
│   ├── schema.prisma            Region, MoodSnapshot, TrendTopic models
│   └── seed.ts                  Seeds the 17 regions
│
├── types/
│   └── mood.ts                  Shared TypeScript types
│
├── public/
│   └── screenshots/
│
├── .env.example                 Documents all optional env vars
└── README.md
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/ashavsingh47/internet-mood-map.git
cd internet-mood-map
```

### 2. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma generate` automatically, so the Prisma client is always ready after install.

### 3. Run the development server

```bash
npm run dev
```

The app works immediately with zero environment variables using the `live-simulation` default.

### 4. Open the app

| Page | URL |
|---|---|
| Landing | http://localhost:3000 |
| Dashboard | http://localhost:3000/dashboard |
| API | http://localhost:3000/api/mood |

### 5. Build for production

```bash
npm run build
npm run start
```

### 6. Optional: configure advanced features

Copy `.env.example` to `.env.local` and fill in only the values you need:

```bash
cp .env.example .env.local
```

See the sections below for details.

---

## Optional: RSS / Semi-Real Data

Set `RSS_FEED_URLS` to a comma-separated list of public RSS or Atom feed URLs. No API key required.

```bash
# .env.local
RSS_FEED_URLS=http://feeds.bbci.co.uk/news/world/rss.xml,https://feeds.npr.org/1004/rss.xml
MOOD_DATA_MODE=hybrid
```

Example feeds (free, no authentication):

- BBC World News: `http://feeds.bbci.co.uk/news/world/rss.xml`
- NPR World: `https://feeds.npr.org/1004/rss.xml`
- Al Jazeera: `https://www.aljazeera.com/xml/rss/all.xml`

How it works:

1. Feeds are fetched server-side on each `/api/mood` call with a 6-second per-feed timeout.
2. Each headline is run through the rule-based NLP scorer.
3. City and country keywords map headlines to one of the 17 dashboard regions.
4. In `hybrid` mode, real-derived regions replace their mock equivalents; unmatched regions stay as live-simulation.
5. In `real` mode, only matched regions are returned (may be fewer than 17).
6. Any feed failure becomes a non-fatal warning in the API response. The dashboard always renders.

---

## Optional: Database Setup (Supabase / PostgreSQL + Prisma)

The app runs without a database. When configured, each `/api/mood` call can save a `MoodSnapshot` per region, and the mood history chart will eventually read from those real snapshots instead of mock data.

### 1. Configure connection strings

```bash
# .env.local
DATABASE_URL=postgresql://...    # pooled connection (runtime)
DIRECT_URL=postgresql://...      # direct connection (migrations, Supabase only)
ENABLE_SNAPSHOT_WRITES=true      # opt-in: save a snapshot on every /api/mood call
```

`ENABLE_SNAPSHOT_WRITES` defaults to `false`. Setting `DATABASE_URL` alone does not start writing — you must explicitly opt in.

### 2. Generate the Prisma client

```bash
npm run prisma:generate
```

### 3. Apply migrations

```bash
npm run prisma:migrate
```

### 4. Seed the 17 regions

```bash
npm run prisma:seed
```

The seed is idempotent — safe to rerun.

### 5. Inspect data (optional)

```bash
npm run prisma:studio
```

### What the database unlocks

- Every `/api/mood` call with `ENABLE_SNAPSHOT_WRITES=true` saves one `MoodSnapshot` row per region plus matched trend topics.
- After at least 3 distinct request timestamps are stored, the history chart starts reading from real snapshots instead of mock data.
- The API response includes `historySource: "database"` and the dashboard's **History** badge updates accordingly.

---

## Optional: AI-Generated Explanations

By default every region's explanation is generated by a deterministic rule-based system. You can optionally upgrade this to an AI provider.

### Configure a provider

```bash
# Option A — OpenAI
AI_EXPLANATION_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini          # optional, this is the default

# Option B — Google Gemini
AI_EXPLANATION_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash     # optional, this is the default
```

Default: `AI_EXPLANATION_PROVIDER=none` — no AI calls happen.

### What changes

- Each region's `explanation` field is replaced with a model-generated sentence: concise, hedged, under 280 characters ("Signals suggest Berlin is reading stressed, likely driven by housing and energy costs.").
- The API response includes `explanationSource: "openai"` / `"gemini"` / `"mixed"` / `"rule-based"`.
- The dashboard's **Explanation** badge updates accordingly.

### Fallback behavior

| Scenario | Result |
|---|---|
| `AI_EXPLANATION_PROVIDER=none` or unset | Rule-based explanations, zero overhead |
| Provider configured but no API key | Rule-based + a warning in the response |
| AI call times out or errors for one region | That region uses rule-based; others still use AI |
| All calls fail | `explanationSource: "rule-based"` |

AI calls are made server-side only. Keys are never sent to the browser. Each `/api/mood` call may make up to 17 small AI calls (concurrency 3 by default, 7-second timeout per call). For cost-sensitive deployments, keep `AI_EXPLANATION_PROVIDER=none`.

---

## Environment Variables

None are required. The app runs in `live-simulation` mode with zero configuration.

| Variable | Default | Description |
|---|---|---|
| `MOOD_DATA_MODE` | `live-simulation` | Default data mode. Accepts `mock`, `live-simulation`, `hybrid`, `real`. Overrideable per request via `?mode=`. |
| `RSS_FEED_URLS` | — | Comma-separated RSS/Atom URLs. Enables hybrid/real data modes. |
| `DATABASE_URL` | — | PostgreSQL connection string (pooled). Enables Prisma snapshot writes and DB-backed history. |
| `DIRECT_URL` | — | Direct (non-pooled) Postgres URL. Required for `prisma migrate` when using a Supabase pooler. |
| `ENABLE_SNAPSHOT_WRITES` | `false` | Set to `true` to write MoodSnapshot rows on each `/api/mood` call. Requires `DATABASE_URL`. |
| `AI_EXPLANATION_PROVIDER` | `none` | Explanation provider. Accepts `none`, `openai`, `gemini`. |
| `OPENAI_API_KEY` | — | Required when `AI_EXPLANATION_PROVIDER=openai`. |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model override. |
| `GEMINI_API_KEY` | — | Required when `AI_EXPLANATION_PROVIDER=gemini`. |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model override. |

Copy `.env.example` to `.env.local` and fill in only what you need. **Never commit `.env.local`.**

---

## Limitations

- **RSS region matching is keyword-based.** Headlines are matched to regions using a city/country keyword dictionary. Ambiguous headlines (e.g. "London, Ontario floods") may be mapped to the wrong region. ML-based entity recognition would improve this.
- **NLP scoring is rule-based, not a trained model.** The emotion classifier counts keywords from curated dictionaries. It does not handle negation, sarcasm, or context. Results are directionally sensible but not production-grade sentiment analysis.
- **`real` mode may return fewer than 17 regions.** Only regions with matched signals are included. The map and dashboard handle this gracefully, but visual coverage can vary by news cycle.
- **AI explanations add latency.** Up to 17 AI calls per `/api/mood` request at concurrency 3. Slow or unavailable providers add up to several seconds of latency. Per-region timeout is 7 seconds.
- **No response-level AI cache.** Each request generates fresh AI explanations. A Vercel KV or in-memory cache keyed on region+mood+topics would reduce cost and latency significantly.
- **Database is optional and unseeded by default.** The history chart shows mock data until `ENABLE_SNAPSHOT_WRITES=true` and enough snapshots accumulate (minimum 3 distinct request timestamps).
- **No production-grade rate limiting.** The API route is open. For a public deployment with AI or DB writes enabled, adding rate limiting or authentication is recommended.
- **English-only NLP and region matching.** Non-English RSS content will likely produce low-confidence or unmatched signals.

---

## Future Improvements

- Broader real-data coverage: GDELT events API, additional RSS sources, multilingual feeds
- Improved NLP: ML-based emotion classifier or a lightweight pre-trained model
- Batched AI explanations: one prompt per response instead of one per region
- Response caching: Vercel KV or Redis to reduce per-call AI and RSS latency
- Historical mood playback: scroll back through time using the DB snapshot timeline
- Region comparison: view two regions side by side
- Share cards: shareable image snapshot of a region's current mood
- Improved mobile layout: collapsible panels, bottom sheet for region insight
- Database analytics: aggregate trends, top topics over time, mood heatmaps
- Authentication / rate limiting for production-grade public deployments

---

## What This Project Demonstrates

- Full-stack Next.js App Router architecture (API routes, server components, client components)
- TypeScript strict mode across the entire codebase
- Data source abstraction with clean interfaces and safe fallback chains
- Zero-dependency RSS/Atom XML parsing
- Rule-based NLP pipeline (text normalization, keyword matching, score aggregation)
- Optional Prisma + PostgreSQL integration with a singleton client pattern
- Optional AI provider integration using raw `fetch()` (no SDKs), with per-call timeouts and graceful degradation
- Responsive dashboard UI with Tailwind CSS
- Interactive maps with Leaflet and React Leaflet
- Data visualization with Recharts
- State management with React hooks
- Shared TypeScript types decoupled from data sources
- Clean git-based phased development approach

---

## Status

Advanced version complete and deployed.

Live app: https://internet-mood-map.vercel.app/

The project has shipped through nine development phases:

- ✅ Landing page and animated intro
- ✅ Interactive dashboard and Leaflet mood map
- ✅ API route with live-simulation mode
- ✅ Search, filter, top spikes, mood history chart
- ✅ Shared TypeScript types and `fetchMoodData` helper
- ✅ Data source abstraction (`mock`, `live-simulation`, `hybrid`, `real`)
- ✅ Rule-based NLP emotion scoring (9 moods, 9 keyword dictionaries)
- ✅ Real RSS ingestion with zero-dependency XML parser + region matcher
- ✅ Optional Prisma + Supabase database layer with snapshot writes and DB-backed history
- ✅ Optional OpenAI / Gemini AI explanation providers with safe fallback
- ✅ Dashboard metadata UI (data-source badges, warnings panel, confidence, matched keywords)
- ✅ Full documentation
