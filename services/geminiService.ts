
import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";
import { PlayerStats, GroundingMetadata } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API Anahtarı bulunamadı. Lütfen process.env.API_KEY olarak ayarlayın.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "NO_KEY_FOUND" });

const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
const IMAGE_MODEL_NAME = 'imagen-3.0-generate-002';

export const generateNarrative = async (sceneId: string, storyPromptSeed: string, playerStats: PlayerStats, previousChoiceText?: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Anahtarı yapılandırılmamış.");

  let prompt = `Sahne ID: ${sceneId}\n`;
  prompt += `Oyuncunun Durumu: İtibar=${playerStats.itibar}, Parti Gücü=${playerStats.partiGucu}, Etik=${playerStats.etik}, Medya=${playerStats.medya}, Moral=${playerStats.moral}\n`;
  if (previousChoiceText) {
    prompt += `Oyuncunun Son Seçimi: "${previousChoiceText}"\n`;
  }
  prompt += `Hikaye Başlangıç Noktası/Temel Senaryo: "${storyPromptSeed}"\n\n`;
  prompt += `Bu bilgileri kullanarak, yukarıdaki temel senaryoyu detaylandırarak mevcut sahneyi canlı, sürükleyici ve Türk siyasi atmosferine uygun bir şekilde anlat. Anlatım yaklaşık 2-3 paragraf uzunluğunda olsun. Dramatik ve gerçekçi bir ton kullan.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: prompt,
         config: {
            temperature: 0.7, // Slightly creative but grounded
            topP: 0.95,
            topK: 40
        }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini metin üretme hatası:", error);
    return `Hata: ${storyPromptSeed} (API ile iletişim kurulamadı veya bir hata oluştu. Lütfen API anahtarınızı kontrol edin.)`;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Anahtarı yapılandırılmamış.");
  
  try {
    const response = await ai.models.generateImages({
        model: IMAGE_MODEL_NAME,
        prompt: `${prompt}, hyperrealistic, dramatic lighting, 8k resolution, cinematic`,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    console.warn("Gemini resim üretme: Resim verisi bulunamadı.", response);
    return ""; // Return empty string or a placeholder if no image
  } catch (error) {
    console.error("Gemini resim üretme hatası:", error);
    return ""; // Return empty string or a placeholder on error
  }
};

// Function to call Gemini with Google Search grounding
export const generateGroundedText = async (query: string): Promise<{text: string, groundingMetadata?: GroundingMetadata}> => {
  if (!API_KEY) throw new Error("API Anahtarı yapılandırılmamış.");

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    return { text: response.text, groundingMetadata };

  } catch (error) {
    console.error("Gemini Google Search ile metin üretme hatası:", error);
    return { text: `Hata: "${query}" sorgusu işlenirken bir sorun oluştu.` };
  }
};
