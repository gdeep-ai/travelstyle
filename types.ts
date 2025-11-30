export interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  description: string;
  seasonalContext: string;
}

export interface SingleOutfit {
  headline: string;
  description: string;
  items: string[];
  colorPalette: string[];
}

export interface OutfitData {
  day: SingleOutfit;
  evening: SingleOutfit;
  dinner: SingleOutfit;
}

export interface PredictionResult {
  weather: WeatherData;
  outfits: OutfitData;
  groundingUrls: string[];
}

export enum StyleOption {
  CASUAL = 'Casual & Comfy',
  SMART_CASUAL = 'Smart Casual',
  BUSINESS_CASUAL = 'Business Casual',
  BUSINESS_PRO = 'Business Professional',
  FORMAL = 'Formal Event',
  ATHLEISURE = 'Athleisure / Sporty',
  TRENDY = 'Trendy / Night Out',
  MINIMALIST = 'Minimalist / Clean',
}

export enum GenderOption {
  FEMALE = 'Female',
  MALE = 'Male',
  NON_BINARY = 'Non-Binary',
  GENDERQUEER = 'Genderqueer',
  AGENDER = 'Agender',
  PREFER_NOT_TO_SAY = 'Prefer not to say'
}

export interface DateRange {
  start: string;
  end: string;
}