"use client";

import dynamic from "next/dynamic";
import type { RegionMood } from "@/data/mockMoodData";

const MoodMap = dynamic(
  () => import("@/components/Map/MoodMap").then((module) => module.MoodMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900 text-slate-400">
        Loading mood map...
      </div>
    ),
  },
);

type MoodMapWrapperProps = {
  regions: RegionMood[];
  selectedRegionId: string;
  onRegionSelect: (regionId: string) => void;
};

export function MoodMapWrapper({
  regions,
  selectedRegionId,
  onRegionSelect,
}: MoodMapWrapperProps) {
  return (
    <MoodMap
      regions={regions}
      selectedRegionId={selectedRegionId}
      onRegionSelect={onRegionSelect}
    />
  );
}
