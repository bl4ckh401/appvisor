import OpenAI from "openai"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Buffer } from "buffer"
import { uploadToStorage } from "@/lib/supabase/storage-utils"
import { generateRequestId } from "@/lib/error-monitoring"
import { toFile } from "openai"

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

// Create OpenAI client only on the server side
const getOpenAIClient = () => {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured")
  }

  // Initialize OpenAI client - only for server-side use
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

/**
 * Generate an image using OpenAI's GPT-Image-1 model
 * This function should only be called from server-side code
 */
export async function generateImageWithGPT(options: GenerateImageOptions): Promise<ImageResult> {
  const requestId = generateRequestId()
  try {
    // Ensure we're running on the server
    if (typeof window !== "undefined") {
      return {
        success: false,
        error: "This function can only be called from server-side code",
      }
    }

    console.log(`Preparing to generate image with GPT-Image-1 model - RequestID: ${requestId}`)

    // Get OpenAI client
    const openai = getOpenAIClient()

    // Extract and validate options - respect user's selections
    const {
      prompt,
      size = "1024x1024",
      quality = "medium",
      format = "png",
      background = options.background || (format === "png" ? "transparent" : "opaque"), // Use provided background if available
      outputCompression,
    } = options

    // Sanitize prompt - remove any leading/trailing whitespace
    const sanitizedPrompt = prompt.trim()

    if (!sanitizedPrompt) {
      return {
        success: false,
        error: "Prompt cannot be empty",
      }
    }

    // Log parameters (without the full prompt for privacy)
    console.log("GPT-Image-1 parameters:", {
      model: "gpt-image-1",
      promptLength: sanitizedPrompt.length,
      size,
      quality,
      format,
      background,
      outputCompression: outputCompression || "default",
      requestId,
    })

    // Prepare request parameters
    const params: any = {
      model: "gpt-image-1",
      prompt: sanitizedPrompt,
      n: 1,
      size,
      quality,
      response_format: "b64_json", // gpt-image-1 always returns b64_json
    }

    // Add background if specified (only for gpt-image-1)
    if (background && background !== "auto") {
      params.background = background
    }

    // Note: output_format and output_compression are generation-only parameters
    // They are not part of the API request but used for post-processing

    console.log(
      `Sending request to OpenAI API - RequestID: ${requestId}`,
      JSON.stringify(
        {
          ...params,
          prompt: sanitizedPrompt.substring(0, 50) + (sanitizedPrompt.length > 50 ? "..." : ""),
        },
        null,
        2,
      ),
    )

    // Generate the image with the OpenAI API
    const response = await openai.images.generate(params)

    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
      console.error(`No image data returned from OpenAI - RequestID: ${requestId}`, response)
      return {
        success: false,
        error: "No image data returned from OpenAI",
      }
    }

    // Get the image base64 data from the response
    const imageBase64 = response.data[0].b64_json
    console.log(`Image data received from OpenAI - RequestID: ${requestId}`)

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, "base64")
    console.log(`Image decoded, size: ${imageBuffer.length} bytes - RequestID: ${requestId}`)

    // Get current user
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const userId = session.user.id
    const timestamp = Date.now()
    const filename = `gpt-image-${timestamp}.${format}`
    const filePath = `${userId}/gpt-images/${filename}`

    // Convert buffer to blob for uploading
    const imageBlob = new Blob([imageBuffer], { type: `image/${format}` })

    console.log(`Uploading image to storage - RequestID: ${requestId}`)

    // Use the uploadToStorage helper function instead of direct upload
    const { publicUrl } = await uploadToStorage({
      bucketName: "assets", // Use the same bucket as Gemini implementation
      filePath: filePath,
      fileBlob: imageBlob,
      contentType: `image/${format}`,
      userId,
      requestId,
    })

    console.log(`Image successfully uploaded and public URL generated - RequestID: ${requestId}`)

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error: any) {
    console.error(`Error generating image with GPT Image - RequestID: ${requestId}:`, error)
    return {
      success: false,
      error: error.message || "Failed to generate image",
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

    // Use the provided values from options, with sensible defaults only if not provided
    const size = options.size || "1024x1024"
    const quality = options.quality || "high" // high, medium, low for gpt-image-1
    const format = options.format || "png" // For the output file, not API parameter
    const background = options.background || "auto" // transparent, opaque, or auto

    console.log(`Edit parameters - size: ${size}, quality: ${quality}, format: ${format}, background: ${background} - RequestID: ${requestId}`)

    // Convert File object(s) to OpenAI file format
    let openAIFiles: any[]
    if (Array.isArray(options.image)) {
      // Handle multiple images for gpt-image-1
      openAIFiles = await Promise.all(
        options.image.map(async (img: File) => {
          const buffer = Buffer.from(await img.arrayBuffer())
          return await toFile(buffer, img.name || "image.png", {
            type: img.type || "image/png"
          })
        })
      )
    } else {
      // Handle single image
      const buffer = Buffer.from(await options.image.arrayBuffer())
      const openAIFile = await toFile(buffer, options.image.name || "image.png", {
        type: options.image.type || "image/png"
      })
      openAIFiles = [openAIFile]
    }

    // Prepare mask if provided
    let maskFile: any = undefined
    if (options.mask) {
      const maskBuffer = Buffer.from(await options.mask.arrayBuffer())
      maskFile = await toFile(maskBuffer, options.mask.name || "mask.png", {
        type: "image/png"
      })
    }

    // Create image edit parameters
    const params: any = {
      model: "gpt-image-1", // Using the gpt-image-1 model
      prompt: options.prompt,
      image: openAIFiles.length === 1 ? openAIFiles[0] : openAIFiles,
      n: 1,
      size, // Use the user-selected size
      quality,
    }

    // Add mask if provided
    if (maskFile) {
      params.mask = maskFile
    }

    // Add background if specified (only for gpt-image-1)
    if (background && background !== "auto") {
      params.background = background
    }

    // Note: output_format and output_compression are not supported for edit endpoint
    // gpt-image-1 always returns b64_json for edits

    // Edit the image
    console.log(`Calling OpenAI API with edit params - RequestID: ${requestId}`)
    console.log("Edit params being sent:", {
      model: params.model,
      size: params.size,
      quality: params.quality,
      background: params.background,
      hasImage: !!params.image,
      hasMask: !!params.mask,
      promptPreview: params.prompt.substring(0, 50) + "..."
    })

    // Note: gpt-image-1 always returns b64_json, not URLs
    const response = await openai.images.edit(params)

    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
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
