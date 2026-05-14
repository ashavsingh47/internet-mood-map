export type Mood =
  | "happy"
  | "angry"
  | "sad"
  | "stressed"
  | "excited"
  | "confused"
  | "fearful"
  | "hopeful"
  | "chaotic";

export type RegionMood = {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  mood: Mood;
  moodScore: number;
  activityLevel: "low" | "medium" | "high";
  trendingTopics: string[];
  explanation: string;
};

export const mockMoodData: RegionMood[] = [
  {
    id: "canada-toronto",
    country: "Canada",
    city: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    mood: "stressed",
    moodScore: 72,
    activityLevel: "high",
    trendingTopics: ["housing", "jobs", "weather", "public transit"],
    explanation:
      "Toronto is showing stressed sentiment because conversations are focused on housing costs, job pressure, cold weather, and commute delays.",
  },
  {
    id: "india-delhi",
    country: "India",
    city: "Delhi",
    lat: 28.6139,
    lng: 77.209,
    mood: "excited",
    moodScore: 81,
    activityLevel: "high",
    trendingTopics: ["cricket", "tech", "movies", "festivals"],
    explanation:
      "Delhi is showing excited sentiment because sports, entertainment, and technology conversations are getting strong engagement.",
  },
  {
    id: "uk-london",
    country: "United Kingdom",
    city: "London",
    lat: 51.5072,
    lng: -0.1276,
    mood: "chaotic",
    moodScore: 68,
    activityLevel: "medium",
    trendingTopics: ["football", "politics", "transport", "cost of living"],
    explanation:
      "London is showing chaotic sentiment because people are discussing football drama, political debates, transport issues, and living costs at the same time.",
  },
  {
    id: "japan-tokyo",
    country: "Japan",
    city: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    mood: "hopeful",
    moodScore: 76,
    activityLevel: "medium",
    trendingTopics: ["tourism", "anime", "robotics", "economy"],
    explanation:
      "Tokyo is showing hopeful sentiment because conversations around tourism, entertainment, robotics, and economic recovery are trending positively.",
  },
  {
    id: "brazil-sao-paulo",
    country: "Brazil",
    city: "São Paulo",
    lat: -23.5558,
    lng: -46.6396,
    mood: "happy",
    moodScore: 84,
    activityLevel: "high",
    trendingTopics: ["music", "football", "culture", "weekend events"],
    explanation:
      "São Paulo is showing happy sentiment because music, football, cultural events, and weekend plans are dominating online conversations.",
  },
];
export type MoodHistoryPoint = {
  time: string;
  happy: number;
  stressed: number;
  excited: number;
  hopeful: number;
  chaotic: number;
};

export const mockMoodHistory: MoodHistoryPoint[] = [
  {
    time: "8 AM",
    happy: 42,
    stressed: 58,
    excited: 49,
    hopeful: 61,
    chaotic: 35,
  },
  {
    time: "10 AM",
    happy: 48,
    stressed: 63,
    excited: 55,
    hopeful: 66,
    chaotic: 41,
  },
  {
    time: "12 PM",
    happy: 55,
    stressed: 70,
    excited: 62,
    hopeful: 72,
    chaotic: 50,
  },
  {
    time: "2 PM",
    happy: 61,
    stressed: 76,
    excited: 71,
    hopeful: 74,
    chaotic: 59,
  },
  {
    time: "4 PM",
    happy: 67,
    stressed: 72,
    excited: 78,
    hopeful: 79,
    chaotic: 64,
  },
  {
    time: "6 PM",
    happy: 73,
    stressed: 68,
    excited: 84,
    hopeful: 82,
    chaotic: 69,
  },
];
