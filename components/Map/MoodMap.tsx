"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Mood, RegionMood } from "@/data/mockMoodData";

type MoodMapProps = {
  regions: RegionMood[];
  selectedRegionId: string;
  onRegionSelect: (regionId: string) => void;
};

const moodMapColors: Record<Mood, string> = {
  happy: "#34d399",
  angry: "#f87171",
  sad: "#60a5fa",
  stressed: "#fbbf24",
  excited: "#e879f9",
  confused: "#fde047",
  fearful: "#fb7185",
  hopeful: "#22d3ee",
  chaotic: "#a78bfa",
};

export function MoodMap({
  regions,
  selectedRegionId,
  onRegionSelect,
}: MoodMapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={true}
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {regions.map((region) => {
        const isSelected = region.id === selectedRegionId;

        return (
          <CircleMarker
            key={region.id}
            center={[region.lat, region.lng]}
            radius={isSelected ? 16 : 12}
            eventHandlers={{
              click: () => onRegionSelect(region.id),
            }}
            pathOptions={{
              color: isSelected ? "#ffffff" : moodMapColors[region.mood],
              fillColor: moodMapColors[region.mood],
              fillOpacity: isSelected ? 0.95 : 0.75,
              weight: isSelected ? 3 : 2,
            }}
          >
            <Popup>
              <div>
                <strong>
                  {region.city}, {region.country}
                </strong>
                <br />
                Mood: {region.mood}
                <br />
                Score: {region.moodScore}/100
                <br />
                Topics: {region.trendingTopics.join(", ")}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
