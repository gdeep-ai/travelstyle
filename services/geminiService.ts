import { GoogleGenAI } from "@google/genai";
import { PredictionResult, StyleOption, AttireOption } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Orchestrates the gathering of weather data and outfit suggestions.
 */
export const getStyleAdvice = async (
  who: string,
  attire: AttireOption,
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
    - Identity: ${who || "Not specified (assume middle-of-the-road persona)"}
    - Attire Preference: ${attire}
    - Destination: ${where}
    - Date Range: ${dateRange || "Not specified (assume current season for the location)"}
    - Aesthetic: ${style}
    - Wardrobe Constraints/Favorites: ${userContext || "None provided"}
    
    ${userImageBase64 ? "NOTE: An image of a specific item or inspiration has been provided. Analyze this image and try to INCORPORATE this item or its style into at least one of the outfit scenarios." : ""}

    SPECIAL INSTRUCTIONS FOR DEFAULTS & STYLE:
    - If "Wardrobe Constraints/Favorites" or "Trip Vibe/Goal" are left blank, favor a blend of "Casual & Comfy", "Minimalist / Clean", and "Trendy" to present a flexible gender-appropriate palette that works for most folks without over/under-dressing.
    - NO NORMCORE EVER. Avoid generic, uninspired "dad" or "basic" looks.
    - NO CROCS. NO HIGH-WAISTED PANTS.
    - Focus on TIMELESS, stylish pieces even when going with Trendy or Night Out styles.
    - For the location, be okay with accepting just a state or a country (e.g., "Uzbekistan") and provide general recommendations based on that region's climate and culture.

    Part 1: Weather Research & Analysis
    1. Retrieve historical weather data for "${where}" during the dates "${dateRange || "the current month"}" for the past 5 years.
    2. Find the forecast for "${where}" during this period.
    3. COMPARE historical patterns with predicted conditions.
    
    Part 2: Style Advice (Four Scenarios)
    Suggest FOUR distinct outfit options for the user's trip. 
    Tone: Editorial, sophisticated, authoritative but accessible. Use fashion terminology appropriate for ${attire}.
    
    Scenarios:
    1. Daytime (Functional/Activity based)
    2. Afternoon/Evening (Relaxed/Transition)
    3. Nice Dinner (Elevated/Going Out)
    4. Night Out (Drinks/Late Night)
    
    CRITICAL STYLING RULES:
    - DO NOT make outfits fully monochromatic. Use a balanced, shoppable matching palette.
    - ALWAYS include a belt if wearing trousers or jeans.
    - ALWAYS include at least: shirt/top, pants/bottoms, and shoes.
    - REPURPOSE items across scenarios to minimize packing.
    - DO NOT include cologne or perfume.
    - ONLY include a pocket square if the outfit includes a sports coat or suit jacket.
    - Focus on timeless, stylish pieces mixed with modern trends.
    - Be clear and specific (e.g., "Cashmere turtleneck", "Selvedge denim", "Double-breasted blazer").
    - Ensure suggestions align with the Attire Preference: ${attire}.
    
    Output Format:
    You MUST return the result as a raw JSON object (no markdown).
    The JSON structure must be:
    {
      "weather": {
        "location": "City/Place Name",
        "temperature": {
          "celsius": 24,
          "fahrenheit": 75,
          "note": "Day High"
        },
        "condition": "e.g. Sunny, Rainy",
        "description": "Short, punchy forecast summary. Use line breaks (\\n) for readability instead of one long paragraph.",
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
          "headline": "Afternoon Transition",
          "description": "Editorial description of the look.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"]
        },
        "dinner": {
          "headline": "The Dinner Cut",
          "description": "Editorial description of the look.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"]
        },
        "nightOut": {
          "headline": "Night Out",
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
    if (focusColor.includes('/')) {
      const [p, a] = focusColor.split('/');
      prompt += ` 
        COLOR DIRECTION: 
        - Primary/Dominant Color: ${p}. The largest pieces (coat, trousers, dress) MUST be in this shade.
        - Accent/Secondary Color: ${a}. Use this for accessories, shoes, or subtle patterns.
        The visual contrast between ${p} and ${a} should be the central theme of the image. 
        Ensure the colors are BOLD and highly saturated.
      `;
    } else {
      prompt += ` 
        COLOR SATURATION: ${focusColor}. 
        The entire outfit MUST be dominated by ${focusColor}. 
        The lighting should have a subtle tint of ${focusColor} to reinforce the theme. 
        Make the color selection UNMISTAKABLE and VIBRANT.
      `;
    }
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