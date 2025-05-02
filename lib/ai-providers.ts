// AI provider options
export type AIProvider = "openai" | "gemini"

export interface AIProviderInfo {
  name: string
  id: AIProvider
  description: string
  capabilities: string[]
  icon: string
}

export const aiProviders: AIProviderInfo[] = [
  {
    name: "OpenAI",
    id: "openai",
    description: "Powered by DALL-E 2, optimized for creative and detailed image generation",
    capabilities: [
      "High-quality image generation",
      "Detailed control over image style",
      "Good at following specific instructions",
    ],
    icon: "sparkles",
  },
  {
    name: "Google Gemini",
    id: "gemini",
    description: "Powered by Google's Imagen 3, excellent for photorealistic images",
    capabilities: [
      "Photorealistic image generation",
      "Multiple aspect ratio options",
      "Good at understanding complex prompts",
    ],
    icon: "zap",
  },
]

export function getProviderInfo(providerId: AIProvider): AIProviderInfo {
  return aiProviders.find((p) => p.id === providerId) || aiProviders[0]
}

export function isProviderAvailable(providerId: AIProvider): boolean {
  if (providerId === "openai") {
    return typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.length > 0
  }
  if (providerId === "gemini") {
    return typeof process.env.GEMINI_API_KEY === "string" && process.env.GEMINI_API_KEY.length > 0
  }
  return false
}
