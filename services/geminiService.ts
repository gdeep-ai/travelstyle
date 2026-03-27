import { GoogleGenAI } from "@google/genai";
import { PredictionResult, StyleOption, AttireOption } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Determines the character alignment based on user inputs.
 */
const determineAlignment = (who: string, style: string) => {
    let lawVsChaos = 0; // Positive for Law, negative for Chaos
    let goodVsEvil = 0; // Positive for Good, negative for Evil

    const lowerWho = who.toLowerCase();
    const lowerStyle = style.toLowerCase();

    // Budget/Persona influence
    if (lowerWho.includes('frugal') || lowerWho.includes('backpacker') || lowerWho.includes('family')) {
        lawVsChaos += 1;
        goodVsEvil += 1;
    } else if (lowerWho.includes('luxury') || lowerWho.includes('business') || lowerWho.includes('night owl')) {
        lawVsChaos -= 1;
        goodVsEvil -= 1;
    }

    // Interests/Style influence
    if (lowerStyle.includes('classic') || lowerStyle.includes('minimalist') || lowerStyle.includes('preppy')) lawVsChaos += 1;
    if (lowerStyle.includes('avant-garde') || lowerStyle.includes('streetwear') || lowerStyle.includes('eclectic')) lawVsChaos -= 1;
    if (lowerStyle.includes('casual') || lowerStyle.includes('bohemian') || lowerStyle.includes('sporty')) goodVsEvil += 1;
    if (lowerStyle.includes('formal') || lowerStyle.includes('goth') || lowerStyle.includes('high fashion')) goodVsEvil -= 0.5;

    const lawAxis = lawVsChaos > 0 ? 'Lawful' : lawVsChaos < 0 ? 'Chaotic' : 'True';
    const goodAxis = goodVsEvil > 0 ? 'Good' : goodVsEvil < 0 ? 'Evil' : 'Neutral';
    
    if (lawAxis === 'True' && goodAxis === 'Neutral') return 'True Neutral';
    if (lawAxis === 'True') return `True ${goodAxis}`;
    if (goodAxis === 'Neutral') return `${lawAxis} Neutral`;

    return `${lawAxis} ${goodAxis}`;
};

export const streamLoadingNarrative = async function*(
  who: string,
  attire: string,
  where: string,
  style: string,
  vibe: string,
  tone: number
) {
  const alignment = determineAlignment(who, style);

  const prompt = `
    You are a friendly RPG storyteller and high-end fashion visual designer.
    The user is traveling to ${where || 'parts unknown'}. Their vibe is ${vibe || 'exploring'}. Their style is ${style}. Their attire preference is ${attire}.
    Their character alignment is ${alignment} with a narrative tone of ${tone} (0=Lighthearted, 100=Dark/Edgy).
    
    Write a short, catchy, editorial storyline (4-5 sentences) describing what their outfits will "say" and the overall color palette you are curating for them.
    Write it as if you are actively working on it right now.
    Separate each sentence with a newline so it can be streamed sentence by sentence.
  `;

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  let buffer = "";
  for await (const chunk of response) {
    buffer += chunk.text;
    const sentences = buffer.match(/[^.!?\n]+[.!?\n]+/g);
    if (sentences) {
      for (let i = 0; i < sentences.length - 1; i++) {
        const s = sentences[i].trim();
        if (s) yield s;
      }
      buffer = sentences[sentences.length - 1];
      if (buffer.trim().match(/[.!?\n]$/)) {
        const s = buffer.trim();
        if (s) yield s;
        buffer = "";
      }
    }
  }
  if (buffer.trim()) {
    yield buffer.trim();
  }
};
export const getStyleAdvice = async (
  who: string,
  attire: AttireOption,
  where: string,
  dateRange: string,
  style: StyleOption,
  userContext: string,
  userImageBase64: string | null,
  localBlend: boolean,
  tone: number
): Promise<PredictionResult> => {
  const modelId = "gemini-2.5-flash"; 
  
  const alignment = determineAlignment(who, style);

  const promptText = `
    You are a friendly RPG storyteller and high-end fashion visual designer. Your task is to convert a PLAYER character sheet into a themed, narrative travel wardrobe experience.

    **PLAYER CHARACTER SHEET:**
    *   **Character Alignment:** ${alignment}
    *   **Narrative Tone (0-100):** ${tone} (0 is extremely Lighthearted/Whimsical, 100 is extremely Dark/Chaotic/Edgy)
    *   **Skills & Interests:** Destination: ${where}. Vibe: ${userContext || "None provided"}.
    *   **Identity:** ${who || "Not specified"}
    *   **Attire Preference:** ${attire} ${attire === 'Gender Neutral' ? '(CRITICAL: Ensure all clothing suggestions are truly androgynous, unisex, and avoid overly gendered silhouettes)' : ''}
    *   **Aesthetic:** ${style}
    
    ${userImageBase64 ? "NOTE: An image of a specific item or inspiration has been provided. Analyze this image and try to INCORPORATE this item or its style into at least one of the outfit scenarios." : ""}
    ${localBlend ? `- LOCAL BLEND ACTIVE: Crucially, adapt the user's chosen aesthetic to seamlessly integrate with the local fashion culture and norms of ${where}. They should look like a stylish local resident, not a tourist.` : ""}

    **YOUR QUEST OBJECTIVES:**
    1.  **Craft a Narrative:** Generate a travel wardrobe that embodies the player's character sheet. The 'headline' and 'description' for each outfit MUST reflect the specified Alignment and Tone. Write like a Dungeon Master curating a high-fashion editorial.
    2.  **Weather Research:** Retrieve historical weather for "${where}" during "${dateRange || "the current month"}" and compare with predicted conditions.

    SPECIAL INSTRUCTIONS FOR DEFAULTS & STYLE:
    - NO NORMCORE EVER. Avoid generic, uninspired "dad" or "basic" looks.
    - NO CROCS. NO HIGH-WAISTED PANTS.
    - Focus on TIMELESS, stylish pieces even when going with Trendy or Night Out styles.
    
    Part 2: Style Advice (Five Scenarios)
    Suggest FIVE distinct outfit options for the user's trip. 
    
    Scenarios:
    1. Transit / Travel Day (Comfortable, layered, practical for planes/trains. NO CROCS.)
    2. Daytime (Functional/Activity based)
    3. Afternoon/Evening (Relaxed/Transition)
    4. Nice Dinner (Elevated/Going Out)
    5. Night Out (Drinks/Late Night)
    
    CRITICAL STYLING RULES:
    - DO NOT make outfits fully monochromatic. Use a balanced, shoppable matching palette.
    - ALWAYS include a belt if wearing trousers or jeans.
    - ALWAYS include at least: shirt/top, pants/bottoms, and shoes.
    - REPURPOSE items across scenarios to minimize packing.
    - DO NOT include cologne, perfume, or luggage (e.g., no duffel bags or suitcases in the outfit items).
    - ONLY include a pocket square if the outfit includes a sports coat or suit jacket.
    - For "brandDNA", suggest 2-3 real-world brands that perfectly capture the aesthetic of the outfit. VARY THE BRANDS WIDELY based on the vibe. Explore different price points and aesthetics.
    
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
        "travel": {
          "headline": "A creative, catchy theme for the outfit, reflecting the player's tone and alignment. e.g., 'The Sun-Dappled Path of Cashmere' or 'A Shadowy Sojourn for Midnight Velvet'.",
          "description": "A compelling explanation of why this outfit is a must-wear, focusing on craftsmanship, silhouette, or the creator's story, all framed by the storyteller persona.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"],
          "brandDNA": ["Brand 1", "Brand 2"]
        },
        "day": {
          "headline": "A creative, catchy theme for the outfit, reflecting the player's tone and alignment.",
          "description": "A compelling explanation of why this outfit is a must-wear, focusing on craftsmanship, silhouette, or the creator's story, all framed by the storyteller persona.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"],
          "brandDNA": ["Brand 1", "Brand 2"]
        },
        "evening": {
          "headline": "A creative, catchy theme for the outfit, reflecting the player's tone and alignment.",
          "description": "A compelling explanation of why this outfit is a must-wear, focusing on craftsmanship, silhouette, or the creator's story, all framed by the storyteller persona.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"],
          "brandDNA": ["Brand 1", "Brand 2"]
        },
        "dinner": {
          "headline": "A creative, catchy theme for the outfit, reflecting the player's tone and alignment.",
          "description": "A compelling explanation of why this outfit is a must-wear, focusing on craftsmanship, silhouette, or the creator's story, all framed by the storyteller persona.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"],
          "brandDNA": ["Brand 1", "Brand 2"]
        },
        "nightOut": {
          "headline": "A creative, catchy theme for the outfit, reflecting the player's tone and alignment.",
          "description": "A compelling explanation of why this outfit is a must-wear, focusing on craftsmanship, silhouette, or the creator's story, all framed by the storyteller persona.",
          "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
          "colorPalette": ["Hex1", "Hex2", "Hex3"],
          "brandDNA": ["Brand 1", "Brand 2"]
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
export const generateOutfitImage = async (outfitDescription: string, style: string, focusColor?: string): Promise<{ url: string | null, error: string | null }> => {
  const modelId = "gemini-2.5-flash-image";

  let prompt = `High-fashion editorial photography, flat lay of a complete outfit on a neutral concrete or marble surface. Items: ${outfitDescription}. Style: ${style}. Minimalist, chic, expensive lighting. Vibrant, high contrast, clear, and sharp.`;

  if (focusColor) {
    if (focusColor.includes('/')) {
      const [p, a] = focusColor.split('/');
      prompt += ` COLOR DIRECTION: Dominant Color: ${p}. Accent Color: ${a}. Ensure the colors are highly saturated and visually distinct.`;
    } else {
      prompt += ` COLOR SATURATION: ${focusColor}. Tonal coordination around ${focusColor}, using complementary shades and textures. Make the color selection vibrant.`;
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return { url: `data:${mimeType};base64,${part.inlineData.data}`, error: null };
      }
    }
    
    return { url: null, error: "No image generated" };
  } catch (error: any) {
    console.error("Error generating image:", error);
    if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
      return { url: null, error: "Image generation quota exceeded. Please try again later." };
    }
    return { url: null, error: "Failed to generate image." };
  }
};