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
    id: "usa-new-york",
    country: "United States",
    city: "New York",
    lat: 40.7128,
    lng: -74.006,
    mood: "angry",
    moodScore: 69,
    activityLevel: "high",
    trendingTopics: ["politics", "rent", "subway delays", "finance"],
    explanation:
      "New York is showing angry sentiment because discussions around rent pressure, politics, public transit, and financial stress are dominating local conversation.",
  },
  {
    id: "usa-los-angeles",
    country: "United States",
    city: "Los Angeles",
    lat: 34.0522,
    lng: -118.2437,
    mood: "excited",
    moodScore: 78,
    activityLevel: "high",
    trendingTopics: ["movies", "music", "influencers", "sports"],
    explanation:
      "Los Angeles is showing excited sentiment because entertainment, sports, music, and creator culture are driving high-energy online engagement.",
  },
  {
    id: "mexico-mexico-city",
    country: "Mexico",
    city: "Mexico City",
    lat: 19.4326,
    lng: -99.1332,
    mood: "confused",
    moodScore: 61,
    activityLevel: "medium",
    trendingTopics: ["elections", "traffic", "weather", "prices"],
    explanation:
      "Mexico City is showing confused sentiment because mixed discussions around politics, traffic, weather changes, and prices are creating uncertain reactions.",
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
    id: "france-paris",
    country: "France",
    city: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    mood: "hopeful",
    moodScore: 74,
    activityLevel: "medium",
    trendingTopics: ["fashion", "tourism", "climate", "art"],
    explanation:
      "Paris is showing hopeful sentiment because tourism, fashion, art, and climate-focused conversations are creating a forward-looking mood.",
  },
  {
    id: "germany-berlin",
    country: "Germany",
    city: "Berlin",
    lat: 52.52,
    lng: 13.405,
    mood: "stressed",
    moodScore: 66,
    activityLevel: "medium",
    trendingTopics: ["economy", "housing", "tech layoffs", "energy"],
    explanation:
      "Berlin is showing stressed sentiment because housing, energy costs, economic pressure, and tech job concerns are appearing often in online discussions.",
  },
  {
    id: "turkey-istanbul",
    country: "Turkey",
    city: "Istanbul",
    lat: 41.0082,
    lng: 28.9784,
    mood: "chaotic",
    moodScore: 71,
    activityLevel: "high",
    trendingTopics: ["football", "inflation", "traffic", "politics"],
    explanation:
      "Istanbul is showing chaotic sentiment because football reactions, inflation concerns, traffic frustration, and political debate are all trending together.",
  },
  {
    id: "nigeria-lagos",
    country: "Nigeria",
    city: "Lagos",
    lat: 6.5244,
    lng: 3.3792,
    mood: "hopeful",
    moodScore: 77,
    activityLevel: "high",
    trendingTopics: ["startups", "music", "youth culture", "business"],
    explanation:
      "Lagos is showing hopeful sentiment because startup growth, music culture, youth conversations, and business opportunities are creating positive momentum.",
  },
  {
    id: "south-africa-cape-town",
    country: "South Africa",
    city: "Cape Town",
    lat: -33.9249,
    lng: 18.4241,
    mood: "happy",
    moodScore: 73,
    activityLevel: "medium",
    trendingTopics: ["tourism", "nature", "sports", "local events"],
    explanation:
      "Cape Town is showing happy sentiment because tourism, nature, sports, and local event discussions are producing mostly positive signals.",
  },
  {
    id: "uae-dubai",
    country: "United Arab Emirates",
    city: "Dubai",
    lat: 25.2048,
    lng: 55.2708,
    mood: "hopeful",
    moodScore: 80,
    activityLevel: "high",
    trendingTopics: ["business", "luxury", "real estate", "technology"],
    explanation:
      "Dubai is showing hopeful sentiment because business, real estate, luxury lifestyle, and technology conversations are trending with positive energy.",
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
    id: "singapore-singapore",
    country: "Singapore",
    city: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    mood: "hopeful",
    moodScore: 79,
    activityLevel: "medium",
    trendingTopics: ["AI", "finance", "education", "travel"],
    explanation:
      "Singapore is showing hopeful sentiment because conversations around AI, finance, education, and travel are creating optimistic signals.",
  },
  {
    id: "south-korea-seoul",
    country: "South Korea",
    city: "Seoul",
    lat: 37.5665,
    lng: 126.978,
    mood: "excited",
    moodScore: 83,
    activityLevel: "high",
    trendingTopics: ["K-pop", "gaming", "technology", "fashion"],
    explanation:
      "Seoul is showing excited sentiment because K-pop, gaming, technology, and fashion conversations are generating high-energy engagement.",
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
    id: "australia-sydney",
    country: "Australia",
    city: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
    mood: "sad",
    moodScore: 58,
    activityLevel: "medium",
    trendingTopics: ["weather", "cost of living", "wildlife", "sports"],
    explanation:
      "Sydney is showing sad sentiment because cost-of-living concerns, weather frustration, and mixed local news are weighing down the emotional tone.",
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
