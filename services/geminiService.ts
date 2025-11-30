import { GoogleGenAI } from "@google/genai";
import { PredictionResult, StyleOption } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Orchestrates the gathering of weather data and outfit suggestions.
 */
export const getStyleAdvice = async (
  who: string,
  where: string,
  date: string,
  style: StyleOption
): Promise<PredictionResult> => {
  const modelId = "gemini-2.5-flash"; 
  
  const prompt = `
    I need you to act as an expert meteorologist and personal stylist.
    
    User Profile:
    - Identity: ${who}
    - Destination: ${where}
    - Date of Trip: ${date}
    - Preferred Style: ${style}
    
    Part 1: Weather Research & Analysis
    1. Retrieve historical weather data for the location "${where}" on/around the date "${date}" for the past 5 years. Look for patterns.
    2. Find the specific forecast for "${where}" on "${date}".
    3. COMPARE the historical patterns with the predicted conditions.
    
    Part 2: Style Advice (Three Scenarios)
    Based on the weather and style, suggest THREE distinct outfit options for the user's day:
    1. Daytime (Functional/Activity based)
    2. Evening (Relaxed/Transition)
    3. Nice Dinner (Elevated/Going Out)
    
    Guidelines:
    - Focus on mainstream, accessible fashion.
    - Be clear and specific with item names (e.g., "Camel Trench Coat" instead of "Coat").
    - The "seasonalContext" should be simple, easy to read, and use bullet points or breaks for readability.
    
    Output Format:
    You MUST return the result as a raw JSON object (no markdown).
    The JSON structure must be:
    {
      "weather": {
        "location": "City/Place Name",
        "temperature": "e.g. 24°C / 75°F",
        "condition": "e.g. Sunny, Rainy",
        "description": "Short forecast summary.",
        "seasonalContext": "A clear, easy-to-read summary of the historical analysis vs current forecast. Use bullet points (•) for key trends."
      },
      "outfits": {
        "day": {
          "headline": "Daytime Look Name",
          "description": "Why this works for the day.",
          "items": ["Item 1", "Item 2", "Item 3"],
          "colorPalette": ["Hex1", "Hex2"]
        },
        "evening": {
          "headline": "Evening Look Name",
          "description": "Why this works for the evening.",
          "items": ["Item 1", "Item 2", "Item 3"],
          "colorPalette": ["Hex1", "Hex2"]
        },
        "dinner": {
          "headline": "Dinner Look Name",
          "description": "Why this works for a nice dinner.",
          "items": ["Item 1", "Item 2", "Item 3"],
          "colorPalette": ["Hex1", "Hex2"]
        }
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract URLs for grounding
    const groundingUrls = groundingChunks
      .map((chunk) => chunk.web?.uri)
      .filter((uri): uri is string => !!uri);

    // Clean up the text response to ensure it's valid JSON
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
      groundingUrls: Array.from(new Set(groundingUrls)), // Remove duplicates
    };

  } catch (error) {
    console.error("Error fetching style advice:", error);
    throw new Error("Failed to generate advice. Please try again.");
  }
};

/**
 * Generates an image of the outfit using a visual model.
 */
export const generateOutfitImage = async (outfitDescription: string, style: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";

  const prompt = `
    Fashion photography, flat lay of a complete outfit.
    Items: ${outfitDescription}.
    Style: ${style}. 
    High quality, photorealistic, neutral background.
    No people.
  `;

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