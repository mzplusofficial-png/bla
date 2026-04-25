import { Type } from "@google/genai";

export interface RefinedIdea {
  id: string;
  originalIdea: string;
  refinedPitch: string;
  targetAudience: string[];
  keyFeatures: {
    title: string;
    description: string;
  }[];
  monetization: string[];
  roadmap: string[];
  challenges: string[];
  timestamp: number;
}

export const REFINEMENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    refinedPitch: {
      type: Type.STRING,
      description: "A professional, compelling one-sentence pitch for the SaaS.",
    },
    targetAudience: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 specific target audience segments.",
    },
    keyFeatures: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
      description: "3 most impactful features that differentiate this SaaS.",
    },
    monetization: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 monetization strategies (e.g., Freemium, usage-based, etc.).",
    },
    roadmap: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 key milestones for the MVP and beyond.",
    },
    challenges: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 potential risks or hurdles and how to overcome them.",
    },
  },
  required: [
    "refinedPitch",
    "targetAudience",
    "keyFeatures",
    "monetization",
    "roadmap",
    "challenges",
  ],
};

export const SYSTEM_INSTRUCTION = `You are a world-class SaaS product strategist and entrepreneur. 
Your goal is to take a raw, simple SaaS idea and refine it into a polished, market-ready concept.
Focus on clarity, actionable insights, and unique value propositions.
Avoid generic advice. Be specific to the user's input. 
Output your response as JSON matching the provided schema.`;
