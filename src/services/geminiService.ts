import { GoogleGenAI } from "@google/genai";
import { REFINEMENT_SCHEMA, SYSTEM_INSTRUCTION, RefinedIdea } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function refineSaaS(originalIdea: string): Promise<Partial<RefinedIdea>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: `Refine this SaaS idea: "${originalIdea}"`
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: REFINEMENT_SCHEMA,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Error refining idea:", error);
    throw error;
  }
}
