import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Buffer } from "buffer"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Types for image generation options
type ImageSize = "1024x1024" | "1536x1024" | "1024x1536" | "auto"
type ImageQuality = "low" | "medium" | "high" | "auto"
type ImageFormat = "png" | "jpeg" | "webp"
type ImageBackground = "transparent" | "opaque" | "auto"

interface GenerateImageOptions {
  prompt: string
  size?: ImageSize
  quality?: ImageQuality
  format?: ImageFormat
  background?: ImageBackground
  outputCompression?: number
}

interface EditImageOptions extends GenerateImageOptions {
  image: File | File[]
  mask?: File
}

interface ImageResult {
  success: boolean
  url?: string
  error?: string
}

// Generate image with GPT Image model
export async function generateImageWithGPT(options: GenerateImageOptions): Promise<ImageResult> {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return {
        success: false,
        error: "OpenAI API key is not configured",
      }
    }

    console.log("Preparing to generate image with GPT Image model")

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const {
      prompt,
      size = "1024x1024",
      quality = "medium",
      format = "png",
      background = "auto",
      outputCompression,
    } = options

    // Log parameters (without the full prompt for privacy)
    console.log("GPT Image parameters:", {
      model: "gpt-image-1",
      promptLength: prompt.length,
      size,
      quality,
      format,
      background,
    })

    // Prepare request parameters
    const params: any = {
      model: "gpt-image-1",
      prompt,
      n: 1,
      response_format: "b64_json",
    }

    // Add optional parameters if specified
    if (size !== "auto") {
      params.size = size
    }

    if (quality !== "auto") {
      params.quality = quality
    }

    if (background !== "auto") {
      params.background = background
    }

    if (format !== "png") {
      params.output_format = format
    }

    if (format !== "png" && outputCompression !== undefined) {
      params.output_compression = outputCompression
    }

    // Generate image
    console.log("Calling OpenAI API to generate image...")
    const response = await openai.images.generate(params)
    console.log("OpenAI API response received")

    if (!response.data[0].b64_json) {
      console.error("No image data returned from OpenAI")
      return {
        success: false,
        error: "No image data returned from OpenAI",
      }
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(response.data[0].b64_json, "base64")

    // Upload to Supabase Storage
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
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

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("mockups")
      .upload(filePath, imageBuffer, {
        contentType: `image/${format}`,
        upsert: true,
      })

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError)
      return {
        success: false,
        error: `Failed to upload image: ${uploadError.message}`,
      }
    }

    // Get public URL
    const { data: urlData } = await supabase.storage.from("mockups").getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error generating image with GPT:", error)
    return {
      success: false,
      error: error.message || "Failed to generate image",
    }
  }
}

// Edit image with GPT Image model
export async function editImageWithGPT(options: EditImageOptions): Promise<ImageResult> {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return {
        success: false,
        error: "OpenAI API key is not configured",
      }
    }

    console.log("Preparing to edit image with GPT Image model")

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const {
      prompt,
      image,
      mask,
      size = "1024x1024",
      quality = "medium",
      format = "png",
      background = "auto",
      outputCompression,
    } = options

    // Log parameters (without the full prompt for privacy)
    console.log("GPT Image parameters:", {
      model: "gpt-image-1",
      promptLength: prompt.length,
      size,
      quality,
      format,
      background,
    })

    // Convert File objects to base64
    const imageArray = Array.isArray(image) ? image : [image]
    const imageBase64Array = await Promise.all(
      imageArray.map(async (img) => {
        const buffer = Buffer.from(await img.arrayBuffer())
        return buffer
      }),
    )

    let maskBase64: Buffer | undefined
    if (mask) {
      const buffer = Buffer.from(await mask.arrayBuffer())
      maskBase64 = buffer
    }

    // Prepare request parameters
    const params: any = {
      model: "gpt-image-1",
      prompt,
      image: imageBase64Array.length === 1 ? imageBase64Array[0] : imageBase64Array,
      response_format: "b64_json",
    }

    // Add mask if provided
    if (maskBase64) {
      params.mask = maskBase64
    }

    // Add optional parameters if specified
    if (size !== "auto") {
      params.size = size
    }

    if (quality !== "auto") {
      params.quality = quality
    }

    if (background !== "auto") {
      params.background = background
    }

    if (format !== "png") {
      params.output_format = format
    }

    if (format !== "png" && outputCompression !== undefined) {
      params.output_compression = outputCompression
    }

    // Edit image
    console.log("Calling OpenAI API to edit image...")
    const response = await openai.images.edit(params)
    console.log("OpenAI API response received")

    if (!response.data[0].b64_json) {
      console.error("No image data returned from OpenAI")
      return {
        success: false,
        error: "No image data returned from OpenAI",
      }
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(response.data[0].b64_json, "base64")

    // Upload to Supabase Storage
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
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
    const filename = `gpt-image-edit-${timestamp}.${format}`
    const filePath = `${userId}/gpt-images/${filename}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("mockups")
      .upload(filePath, imageBuffer, {
        contentType: `image/${format}`,
        upsert: true,
      })

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError)
      return {
        success: false,
        error: `Failed to upload image: ${uploadError.message}`,
      }
    }

    // Get public URL
    const { data: urlData } = await supabase.storage.from("mockups").getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error editing image with GPT:", error)
    return {
      success: false,
      error: error.message || "Failed to edit image",
    }
  }
}
