export interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  description: string;
  seasonalContext: string; // New field for historical analysis
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