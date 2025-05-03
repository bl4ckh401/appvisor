import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Generate content with Gemini
export async function generateContentWithGemini(prompt: string, model = "gemini-pro") {
  try {
    // Get the model
    const geminiModel = genAI.getGenerativeModel({ model })

    // Generate content
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      content: text,
    }
  } catch (error) {
    console.error("Error generating content with Gemini:", error)
    return {
      success: false,
      error: error.message || "Failed to generate content with Gemini",
    }
  }
}

// Generate image with Imagen (via Gemini API)
export async function generateImageWithImagen(
  prompt: string,
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16" = "1:1",
) {
  try {
    // Get the model
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    // Generate image
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: `Generate an image of: ${prompt}` }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
        responseMimeType: "image/png",
      },
    })

    // Get the image data
    const response = await result.response
    const imageData = response.candidates[0].content.parts[0].inlineData.data

    return {
      success: true,
      imageBytes: imageData,
    }
  } catch (error) {
    console.error("Error generating image with Imagen:", error)
    return {
      success: false,
      error: error.message || "Failed to generate image with Imagen",
    }
  }
}

// Generate image with Gemini
export async function generateImageWithGemini(prompt: string, size = "1024x1024") {
  try {
    // For now, we'll use the same function as generateImageWithImagen
    // In the future, this can be updated when Gemini has a dedicated image generation API
    const result = await generateImageWithImagen(prompt)

    if (!result.success) {
      throw new Error(result.error || "Failed to generate image with Gemini")
    }

    return result.imageBytes ? `data:image/png;base64,${result.imageBytes}` : null
  } catch (error) {
    console.error("Error generating image with Gemini:", error)
    return null
  }
}
