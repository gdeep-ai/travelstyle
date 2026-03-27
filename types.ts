export interface WeatherData {
  location: string;
  temperature: {
    celsius: number;
    fahrenheit: number;
    note: string;
  };
  condition: string;
  description: string;
  seasonalContext: string;
}

export interface SingleOutfit {
  headline: string;
  description: string;
  items: string[];
  colorPalette: string[];
  brandDNA: string[];
}

export interface OutfitData {
  travel: SingleOutfit;
  day: SingleOutfit;
  evening: SingleOutfit;
  dinner: SingleOutfit;
  nightOut: SingleOutfit;
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
  TRENDY = 'Trendy',
  NIGHT_OUT = 'Night Out',
  MINIMALIST = 'Minimalist / Clean',
}

export enum AttireOption {
  WOMAN = 'Womenswear',
  MAN = 'Menswear',
  NEUTRAL = 'Gender Neutral'
}

export interface DateRange {
  start: string;
  end: string;
}