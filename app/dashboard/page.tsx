"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LiveStatus } from "@/components/Dashboard/LiveStatus";
import { MoodHistoryChart } from "@/components/Dashboard/MoodHistoryChart";
import { RegionCard } from "@/components/Dashboard/RegionCard";
import { RegionFilters } from "@/components/Dashboard/RegionFilters";
import { RegionInsight } from "@/components/Dashboard/RegionInsight";
import { StatCard } from "@/components/Dashboard/StatCard";
import { TopMoodSpikes } from "@/components/Dashboard/TopMoodSpikes";
import { MoodLegend } from "@/components/Map/MoodLegend";
import { MoodMapWrapper } from "@/components/Map/MoodMapWrapper";
import type { Mood, MoodHistoryPoint, RegionMood } from "@/data/mockMoodData";
import { moodStyles } from "@/lib/moodStyles";
import { formatMoodLabel } from "@/lib/moodUtils";

type MoodFilter = Mood | "all";

type MoodApiResponse = {
  status: string;
  generatedAt: string;
  summary: {
    regionsSampled: number;
    globalMood: Mood;
    averageMoodScore: number;
    highActivityZones: number;
  };
  regions: RegionMood[];
  history: MoodHistoryPoint[];
};

export default function DashboardPage() {
  const [regions, setRegions] = useState<RegionMood[]>([]);
  const [history, setHistory] = useState<MoodHistoryPoint[]>([]);
  const [summary, setSummary] = useState<MoodApiResponse["summary"] | null>(
    null,
  );
  const [generatedAt, setGeneratedAt] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const loadMoodData = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsRefreshing(true);

      const response = await fetch("/api/mood", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load mood data.");
      }

      const data = (await response.json()) as MoodApiResponse;

      setRegions(data.regions);
      setHistory(data.history);
      setSummary(data.summary);
      setGeneratedAt(data.generatedAt);

      setSelectedRegionId((currentRegionId) => {
        return currentRegionId || data.regions[0]?.id || "";
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading mood data.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMoodData();
  }, [loadMoodData]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadMoodData();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoRefreshEnabled, loadMoodData]);

  const filteredRegions = useMemo(() => {
    return regions.filter((region) => {
      const searchText = searchQuery.toLowerCase().trim();

      const matchesSearch =
        searchText.length === 0 ||
        region.country.toLowerCase().includes(searchText) ||
        region.city.toLowerCase().includes(searchText) ||
        region.mood.toLowerCase().includes(searchText) ||
        region.trendingTopics.some((topic) =>
          topic.toLowerCase().includes(searchText),
        );

      const matchesMood =
        selectedMood === "all" || region.mood === selectedMood;

      return matchesSearch && matchesMood;
    });
  }, [regions, searchQuery, selectedMood]);

  useEffect(() => {
    const selectedRegionIsVisible = filteredRegions.some((region) => {
      return region.id === selectedRegionId;
    });

    if (!selectedRegionIsVisible && filteredRegions.length > 0) {
      setSelectedRegionId(filteredRegions[0].id);
    }
  }, [filteredRegions, selectedRegionId]);

  function handleResetFilters() {
    setSearchQuery("");
    setSelectedMood("all");
    setSelectedRegionId(regions[0]?.id || "");
  }

  if (isLoading) {
    return (
      <main className="mood-bg flex min-h-screen items-center justify-center px-6 text-white">
        <div className="glass-panel rounded-3xl p-8 text-center">
          <p className="section-kicker">Loading Mood Intelligence</p>
          <h1 className="mt-3 text-3xl font-bold">Fetching live signals...</h1>
          <p className="mt-3 text-slate-400">
            The dashboard is requesting mood data from the API.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !summary || regions.length === 0) {
    return (
      <main className="mood-bg flex min-h-screen items-center justify-center px-6 text-white">
        <div className="glass-panel rounded-3xl p-8 text-center">
          <p className="section-kicker">Mood API Error</p>
          <h1 className="mt-3 text-3xl font-bold">Could not load dashboard</h1>
          <p className="mt-3 text-slate-400">
            {errorMessage || "No mood data was returned from the API."}
          </p>
        </div>
      </main>
    );
  }

  const selectedRegion =
    regions.find((region) => region.id === selectedRegionId) ?? regions[0];

  const globalMood = summary.globalMood;
  const averageMoodScore = summary.averageMoodScore;
  const globalMoodLabel = formatMoodLabel(globalMood);

  const formattedGeneratedAt = new Date(generatedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <main className="mood-bg min-h-screen text-white">
      <section className="mood-content mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
          <div>
            <p className="section-kicker">Live Mood Intelligence</p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Global Internet Mood Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Track emotional signals across regions using mood scores, trending
              topics, map markers, and AI-style explanations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <LiveStatus />

            <button
              type="button"
              onClick={loadMoodData}
              disabled={isRefreshing}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Signals"}
            </button>

            <button
              type="button"
              onClick={() =>
                setAutoRefreshEnabled((currentValue) => !currentValue)
              }
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                autoRefreshEnabled
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                  : "border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {autoRefreshEnabled ? "Auto On" : "Auto Off"}
            </button>

            <a
              href="/"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Home
            </a>
          </div>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Regions Sampled"
            value={summary.regionsSampled}
            description="Regions returned by the mood API."
          />

          <StatCard
            label="Average Mood"
            value={`${averageMoodScore}/100`}
            description="Average emotional signal intensity."
          />

          <StatCard
            label="High Activity"
            value={summary.highActivityZones}
            description="Regions with strong conversation activity."
          />

          <StatCard
            label="Global Mood"
            value={globalMoodLabel}
            description="Most common mood in current API response."
          />
        </div>

        <div className="grid flex-1 gap-5 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="glass-panel glass-panel-cyan rounded-3xl p-5">
            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold">Mood Map</h2>

                <p className="mt-1 text-sm text-slate-400">
                  API generated at{" "}
                  <span className="font-semibold text-white">
                    {formattedGeneratedAt}
                  </span>
                </p>
              </div>

              <span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                API Powered
              </span>
            </div>

            <div className="h-[355px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 sm:h-[410px] xl:h-[460px]">
              <MoodMapWrapper
                regions={filteredRegions}
                selectedRegionId={selectedRegionId}
                onRegionSelect={setSelectedRegionId}
              />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <MoodLegend />
              <MoodHistoryChart data={history} />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="glass-panel card-hover rounded-3xl p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-cyan-300">
                  Current Global Mood
                </h2>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${moodStyles[globalMood]}`}
                >
                  {averageMoodScore}/100
                </span>
              </div>

              <p className="mt-3 text-4xl font-black">{globalMoodLabel}</p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Based on {summary.regionsSampled} API-loaded regions, the
                internet is currently showing a mostly {globalMood} emotional
                pattern.
              </p>
            </div>

            <RegionInsight region={selectedRegion} />

            <TopMoodSpikes
              regions={regions}
              onRegionSelect={setSelectedRegionId}
            />

            <RegionFilters
              searchQuery={searchQuery}
              selectedMood={selectedMood}
              onSearchChange={setSearchQuery}
              onMoodChange={setSelectedMood}
              onReset={handleResetFilters}
            />

            <div className="glass-panel card-hover rounded-3xl p-5">
              <div>
                <h2 className="text-xl font-bold text-cyan-300">
                  Matching Regions
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Showing {filteredRegions.length} of {regions.length} regions.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => (
                    <RegionCard
                      key={region.id}
                      region={region}
                      isSelected={region.id === selectedRegionId}
                      onClick={() => setSelectedRegionId(region.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p className="text-sm text-slate-400">
                      No regions match your current search or mood filter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
