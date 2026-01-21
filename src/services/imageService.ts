import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateGameImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `16-bit VGA pixel art adventure game background, Sierra style, King's Quest IV aesthetic, vibrant but limited palette, dithering, pixelated. Subject: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image generation failed:", error);
    // Fallback to a themed placeholder if generation fails
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1280/720?grayscale`;
  }
};
