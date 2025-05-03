import { GoogleGenAI } from "@google/genai"

// Initialize the Google AI client
let googleAI: GoogleGenAI | null = null

export function getGoogleAI() {
  if (!googleAI && process.env.GEMINI_API_KEY) {
    googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }
  return googleAI
}

/**
 * Generate an image using Google's Imagen 3 model
 */
export async function generateImageWithImagen(
  prompt: string,
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" = "1:1",
  numberOfImages = 1,
) {
  try {
    const ai = getGoogleAI()
    if (!ai) {
      throw new Error("Google AI client not initialized. Check your API key.")
    }

    console.log("Generating image with Imagen 3:", {
      prompt: prompt.substring(0, 50) + "...",
      aspectRatio,
      numberOfImages,
    })

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: prompt,
      config: {
        numberOfImages: Math.min(numberOfImages, 4), // Maximum of 4 images per request
        aspectRatio,
        personGeneration: "ALLOW_ADULT", // Default setting
      },
    })

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No images were generated")
    }

    // Return the base64 image data from the first generated image
    const imageBytes = response.generatedImages[0].image.imageBytes
    return {
      success: true,
      imageBytes,
    }
  } catch (error: any) {
    console.error("Error generating image with Imagen:", error)
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    }
  }
}

/**
 * Generate content (text and images) using Gemini 2.0 Flash
 */
export async function generateContentWithGemini(prompt: string, imageBase64?: string) {
  try {
    const ai = getGoogleAI()
    if (!ai) {
      throw new Error("Google AI client not initialized. Check your API key.")
    }

    // Prepare content parts
    const contents: any[] = [{ text: prompt }]

    // Add image if provided
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      })
    }

    console.log("Generating content with Gemini:", {
      prompt: prompt.substring(0, 50) + "...",
      hasImage: !!imageBase64,
    })

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    })

    // Extract image from response if available
    let imageBytes = null
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageBytes = part.inlineData.data
        break
      }
    }

    if (!imageBytes) {
      throw new Error("No image was generated in the response")
    }

    return {
      success: true,
      imageBytes,
    }
  } catch (error: any) {
    console.error("Error generating content with Gemini:", error)
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    }
  }
}

/**
 * Generate an image using Google's Gemini model
 */
export async function generateImageWithGemini(
  prompt: string,
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" = "1:1",
  numberOfImages = 1,
) {
  try {
    // For image generation, we'll use the Gemini model's image generation capabilities
    const result = await generateContentWithGemini(prompt)

    if (!result.success) {
      throw new Error(result.error || "Failed to generate image with Gemini")
    }

    return {
      success: true,
      imageBytes: result.imageBytes,
    }
  } catch (error: any) {
    console.error("Error generating image with Gemini:", error)
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    }
  }
}
