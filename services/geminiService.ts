import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingChunk } from "../types";

// Helper to ensure API key is present
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key required");
  }
  return new GoogleGenAI({ apiKey });
};

export const searchNGOs = async (
  query: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<SearchResult> => {
  const ai = getClient();
  
  const retrievalConfig = userLocation
    ? { latLng: userLocation }
    : undefined;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find non-profit organizations (NGOs) or charities related to: "${query}". 
      Focus on places that accept volunteers or donations. 
      Provide a helpful summary and list specific places found. 
      If location is provided, prioritize nearby results.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: retrievalConfig
        }
      },
    });

    const text = response.text || "Não foi possível encontrar informações.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    return { text, chunks };
  } catch (error) {
    console.error("Error searching NGOs:", error);
    throw error;
  }
};

export const generateImpactVideo = async (prompt: string): Promise<string> => {
  const ai = getClient();

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned");
    }

    // Append API key for playback
    return `${videoUri}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

export const checkApiKeySelection = async (): Promise<boolean> => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        return await window.aistudio.hasSelectedApiKey();
    }
    return true; // Fallback if not in the specific environment, assume env var is set
};

export const promptApiKeySelection = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
    }
};