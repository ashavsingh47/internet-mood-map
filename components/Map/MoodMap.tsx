"use client";

import { useMemo } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Mood, RegionMood } from "@/data/mockMoodData";

type MoodMapProps = {
  regions: RegionMood[];
  selectedRegionId: string;
  onRegionSelect: (regionId: string) => void;
};

type MoodMarkerProps = {
  region: RegionMood;
  isSelected: boolean;
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

function MoodMarker({ region, isSelected, onRegionSelect }: MoodMarkerProps) {
  const icon = useMemo(() => {
    const color = moodMapColors[region.mood];

    return divIcon({
      className: "mood-marker-wrapper",
      html: `
        <div
          class="mood-marker ${isSelected ? "mood-marker-selected" : ""}"
          style="--mood-color: ${color}"
        >
          <span class="mood-marker-pulse"></span>
          <span class="mood-marker-core"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, [region.mood, isSelected]);

  return (
    <Marker
      position={[region.lat, region.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onRegionSelect(region.id),
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
    </Marker>
  );
}

export function MoodMap({
  regions,
  selectedRegionId,
  onRegionSelect,
}: MoodMapProps) {
  return (
    <MapContainer
      key="internet-mood-map"
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={true}
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {regions.map((region) => (
        <MoodMarker
          key={region.id}
          region={region}
          isSelected={region.id === selectedRegionId}
          onRegionSelect={onRegionSelect}
        />
      ))}
    </MapContainer>
  );
}
