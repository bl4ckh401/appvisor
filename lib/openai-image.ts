import OpenAI from "openai"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Buffer } from "buffer"
import { uploadToStorage } from "@/lib/supabase/storage-utils"
import { generateRequestId } from "@/lib/error-monitoring"

// Types for image generation options
type ImageFormat = "png" | "jpeg" | "webp"
type ImageQuality = "low" | "medium" | "high" | "auto"
type ImageSize = "1024x1024" | "1024x1536" | "1536x1024" | "auto"
type ImageBackground = "transparent" | "opaque" | "auto"

interface GenerateImageOptions {
  prompt: string
  size?: ImageSize
  quality?: ImageQuality
  format?: ImageFormat
  background?: ImageBackground
  outputCompression?: number
}

interface ImageResult {
  success: boolean
  url?: string
  error?: string
}

// Ensure this only runs on the server
const getOpenAIClient = () => {
  // Check if we're on the server
  if (typeof window !== "undefined") {
    throw new Error("OpenAI client can only be initialized on the server")
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

interface GenerateImageParams {
  prompt: string
  size?: "1024x1024" | "1792x1024" | "1024x1792"
  quality?: "standard" | "hd"
  format?: "png" | "jpeg" | "webp"
}

interface GenerateImageResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Generate an image using OpenAI's DALL·E 3 model
 * This function should only be called from server-side code
 */
export async function generateImageWithGPT({
  prompt,
  size = "1024x1024",
  quality = "standard",
  format = "png",
}: GenerateImageParams): Promise<GenerateImageResult> {
  try {
    // Ensure we're on the server
    if (typeof window !== "undefined") {
      return {
        success: false,
        error: "OpenAI client can only be initialized on the server",
      }
    }

    // Get the OpenAI client
    const openai = getOpenAIClient()

    // Generate the image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality,
      response_format: format,
    })

    // Check if we have a valid response
    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      return {
        success: false,
        error: "No image was generated",
      }
    }

    return {
      success: true,
      url: response.data[0].url,
    }
  } catch (error) {
    console.error("Error generating image with GPT:", error)

    // Extract the error message
    let errorMessage = "Failed to generate image"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Edit an image using OpenAI's GPT-Image model
 */
export async function editImageWithGPT(options: any): Promise<ImageResult> {
  const requestId = generateRequestId()
  try {
    const openai = getOpenAIClient()

    console.log(`Starting image edit with GPT-Image-1 - RequestID: ${requestId}`)

    // Set default values for optional parameters
    const size = options.size || "1024x1024"
    const quality = options.quality || "auto"
    const format = options.format || "png"
    const background = options.background || (format === "png" ? "transparent" : "opaque")

    // Convert File object(s) to OpenAI file format
    let images: any[]
    if (Array.isArray(options.image)) {
      // Handle multiple images
      images = await Promise.all(
        options.image.map(async (img) => {
          const buffer = Buffer.from(await img.arrayBuffer())
          return buffer
        }),
      )
    } else {
      // Handle single image
      const buffer = Buffer.from(await options.image.arrayBuffer())
      images = [buffer]
    }

    // Prepare mask if provided
    let mask: Buffer | undefined
    if (options.mask) {
      mask = Buffer.from(await options.mask.arrayBuffer())
    }

    // Create image edit parameters
    const params: any = {
      model: "gpt-image-1", // Using the gpt-image-1 model
      prompt: options.prompt,
      image: images,
      response_format: "b64_json",
      size,
      quality,
    }

    // Add mask if provided
    if (mask) {
      params.mask = mask
    }

    // Add optional parameters if provided
    if (background && background !== "auto") {
      params.background = background
    }

    // Add compression for jpeg and webp formats
    if ((format === "jpeg" || format === "webp") && typeof options.outputCompression === "number") {
      params.output_compression = options.outputCompression / 100 // Convert percentage to decimal
    }

    // Edit the image
    console.log(`Calling OpenAI API with edit params - RequestID: ${requestId}:`, {
      ...params,
      prompt: params.prompt.substring(0, 100) + (params.prompt.length > 100 ? "..." : ""),
      image: "<<image buffer(s)>>",
      mask: mask ? "<<mask buffer>>" : undefined,
    })

    const response = await openai.images.edit(params)

    if (!response.data[0].b64_json) {
      throw new Error("No image data returned from the API")
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(response.data[0].b64_json, "base64")
    const blob = new Blob([imageBuffer], { type: `image/${format}` })

    // Generate a unique filename
    const fileName = `${options.prompt ? options.prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "-") : "edited"}-${uuidv4().substring(0, 8)}.${format}`
    const filePath = `edited-images/${fileName}`

    // Get user ID from session
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No authenticated user found")
    }

    const userId = session.user.id

    // Upload to storage using the helper function
    const { publicUrl } = await uploadToStorage({
      bucketName: "assets",
      filePath: `${userId}/${filePath}`,
      fileBlob: blob,
      contentType: `image/${format}`,
      userId,
      requestId,
    })

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error: any) {
    console.error(`Error editing image with GPT Image - RequestID: ${requestId}:`, error)
    return {
      success: false,
      error: error.message || "Failed to edit image",
    }
  }
}
