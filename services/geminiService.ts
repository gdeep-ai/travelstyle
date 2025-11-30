import { GoogleGenAI } from "@google/genai";
import { PredictionResult, StyleOption, GenderOption } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Orchestrates the gathering of weather data and outfit suggestions.
 */
export const getStyleAdvice = async (
  who: string,
  gender: GenderOption,
  where: string,
  dateRange: string,
  style: StyleOption,
  userContext: string,
  userImageBase64: string | null
): Promise<PredictionResult> => {
  const modelId = "gemini-2.5-flash"; 
  
  const promptText = `
    I need you to act as an expert Editor-in-Chief of a high-end fashion publication (like Vogue, GQ, Harper's Bazaar) and a meteorologist.
    
    User Profile:
    - Identity: ${who}
    - Gender Identity: ${gender}
    - Destination: ${where}
    - Date Range: ${dateRange}
    - Aesthetic: ${style}
    - Wardrobe Constraints/Favorites: ${userContext || "None provided"}
    
    ${userImageBase64 ? "NOTE: An image of a specific item or inspiration has been provided. Analyze this image and try to INCORPORATE this item or its style into at least one of the outfit scenarios." : ""}

    Part 1: Weather Research & Analysis
    1. Retrieve historical weather data for "${where}" during the dates "${dateRange}" for the past 5 years.
    2. Find the forecast for "${where}" during this period.
    3. COMPARE historical patterns with predicted conditions.
    
    Part 2: Style Advice (Three Scenarios)
    Suggest THREE distinct outfit options for the user's trip. 
    Tone: Editorial, sophisticated, authoritative but accessible. Use fashion terminology appropriate for ${gender}.
    
    Scenarios:
    1. Daytime (Functional/Activity based)
    2. Evening (Relaxed/Transition)
    3. Nice Dinner (Elevated/Going Out)
    
    Guidelines:
    - Focus on timeless, stylish pieces mixed with modern trends.
    - Be clear and specific (e.g., "Cashmere turtleneck", "Selvedge denim", "Double-breasted blazer").
    - The "seasonalContext" should be concise and formatted for quick reading (bullet points).
    - Ensure suggestions align with the Gender Identity: ${gender}.
    
    Output Format:
    You MUST return the result as a raw JSON object (no markdown).
    The JSON structure must be:
    {
      "weather": {
        "location": "City/Place Name",
        "temperature": "e.g. 24°C / 75°F (Average)",
        "condition": "e.g. Sunny, Rainy",
        "description": "Short, punchy forecast summary.",
        "seasonalContext": "Analysis of historical vs current. Use • bullets."
      },
      "outfits": {
        "day": {
          "headline": "Daytime Edit",
          "description": "Editorial description of the look.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"]
        },
        "evening": {
          "headline": "Evening Transition",
          "description": "Editorial description of the look.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"]
        },
        "dinner": {
          "headline": "The Dinner Cut",
          "description": "Editorial description of the look.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"]
        }
      }
    }
  `;

  const parts: any[] = [{ text: promptText }];

  if (userImageBase64) {
    const base64Data = userImageBase64.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: "image/jpeg", // Assuming jpeg/png for simplicity, or extract from string
        data: base64Data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { role: 'user', parts: parts },
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const groundingUrls = groundingChunks
      .map((chunk) => chunk.web?.uri)
      .filter((uri): uri is string => !!uri);

    let cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    const parsedData = JSON.parse(cleanJson);

    return {
      weather: parsedData.weather,
      outfits: parsedData.outfits,
      groundingUrls: Array.from(new Set(groundingUrls)), 
    };

  } catch (error) {
    console.error("Error fetching style advice:", error);
    throw new Error("Failed to generate advice. Please try again.");
  }
};

/**
 * Generates an image of the outfit using a visual model.
 */
export const generateOutfitImage = async (outfitDescription: string, style: string, focusColor?: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";

  let prompt = `
    High-fashion editorial photography, flat lay of a complete outfit on a neutral concrete or marble surface.
    Items: ${outfitDescription}.
    Style: ${style}. 
    Minimalist, chic, expensive lighting.
    No people.
  `;

  if (focusColor) {
    prompt += ` Emphasis on the color ${focusColor}. The lighting and accessories should highlight ${focusColor} tones.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return "";
  } catch (error) {
    console.error("Error generating image:", error);
    return "";
  }
};