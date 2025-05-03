import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { monitorAPICall } from "@/lib/api-monitoring"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"
import { generateImageWithImagen } from "@/lib/google-ai"
import type { Database } from "@/lib/database.types"

// --- Constants ---
const SUPABASE_BUCKET_NAME = "assets"

export async function POST(request: Request) {
  const requestId = generateRequestId()
  console.log(`[${new Date().toISOString()}] Received POST /api/gemini/generate-image - RequestID: ${requestId}`)

  // 1. Check API key configuration
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-image",
        errorMessage: "Gemini API key is not configured on the server",
        timestamp: new Date(),
        requestId,
      }),
      { status: 503 },
    )
  }

  // 2. Authentication check
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-image",
        errorMessage: "Failed to authenticate user session",
        timestamp: new Date(),
        requestId,
        rawError: sessionError,
      }),
      { status: 401 },
    )
  }

  if (!session) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-image",
        errorMessage: "Unauthorized: Authentication required",
        timestamp: new Date(),
        requestId,
      }),
      { status: 401 },
    )
  }

  const userId = session.user.id
  console.log(`Authenticated user ID: ${userId} - RequestID: ${requestId}`)

  // 3. Parse request body
  let body
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-image",
        errorMessage: "Invalid request format: Malformed JSON",
        timestamp: new Date(),
        requestId,
        userId,
        rawError: e,
      }),
      { status: 400 },
    )
  }

  console.log(
    "Request body parsed - RequestID: " + requestId,
    JSON.stringify({
      ...body,
      prompt: body.prompt ? `${body.prompt.substring(0, 80)}...` : "[Not Provided]",
    }),
  )

  const { prompt, aspectRatio = "1:1" } = body

  // 4. Validate request parameters
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-image",
        errorMessage: "Prompt is required and cannot be empty",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  if (prompt.length > 2000) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-image",
        errorMessage: "Prompt is too long (max 2000 characters)",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  // Validate aspect ratio
  const validAspectRatios = ["1:1", "4:3", "3:4", "16:9", "9:16"]
  if (aspectRatio && !validAspectRatios.includes(aspectRatio)) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-image",
        errorMessage: `Invalid aspect ratio. Must be one of: ${validAspectRatios.join(", ")}`,
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  try {
    // 5. Generate the image using Imagen 3
    console.log(`Initiating Imagen 3 image generation for user ${userId} - RequestID: ${requestId}`)

    const generationResult = await monitorAPICall(
      {
        apiName: "imagen",
        endpoint: "generate-image",
        userId,
      },
      async () => {
        return await generateImageWithImagen(prompt, aspectRatio as "1:1" | "4:3" | "3:4" | "16:9" | "9:16")
      },
      {
        prompt: prompt.substring(0, 50) + "...", // Only log part of the prompt
        aspectRatio,
      },
    )

    if (!generationResult.success || !generationResult.imageBytes) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "imagen",
          endpoint: "generate-image",
          errorMessage: `Failed to generate image: ${generationResult.error || "Unknown error"}`,
          timestamp: new Date(),
          requestId,
          userId,
        }),
        { status: 500 },
      )
    }

    // 6. Try to store the image in Supabase, but don't fail if storage fails
    const imageBytesBase64 = generationResult.imageBytes
    let publicUrl: string | null = null
    let storageError: Error | null = null

    try {
      const imageBuffer = Buffer.from(imageBytesBase64, "base64")
      const imageBlob = new Blob([imageBuffer], { type: "image/png" })

      console.log(`Generated image blob size: ${imageBlob.size} bytes - RequestID: ${requestId}`)
      if (imageBlob.size === 0) {
        throw new Error("Generated image data resulted in an empty blob")
      }

      const timestamp = Date.now()
      const fileName = `generated-images/${userId}/imagen-${timestamp}-${requestId.slice(0, 8)}.png`

      console.log(
        `Attempting to upload image to Supabase storage: ${SUPABASE_BUCKET_NAME}/${fileName} - RequestID: ${requestId}`,
      )

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .upload(fileName, imageBlob, {
          contentType: "image/png",
          upsert: false,
        })

      if (uploadError) {
        throw new Error(
          `Supabase storage upload failed: ${uploadError.message} (Status: ${uploadError.statusCode ?? "N/A"})`,
        )
      }

      console.log(`Successfully uploaded to ${SUPABASE_BUCKET_NAME}/${fileName} - RequestID: ${requestId}`)

      const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET_NAME).getPublicUrl(fileName)

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file")
      }

      publicUrl = urlData.publicUrl
      console.log(`Generated public URL: ${publicUrl} - RequestID: ${requestId}`)
    } catch (error: any) {
      // Log the error but don't fail the request
      console.error(`Storage error - RequestID: ${requestId}`, error)
      storageError = error
    }

    // 7. Return the successful response with both URL (if available) and base64 data
    console.log(`Successfully completed image generation request - RequestID: ${requestId}`)
    return NextResponse.json({
      url: publicUrl, // This will be null if storage failed
      imageData: `data:image/png;base64,${imageBytesBase64}`, // Always include the image data
      requestId,
      provider: "imagen",
      storageError: storageError ? storageError.message : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "imagen",
        endpoint: "generate-image",
        errorMessage: "An unexpected server error occurred while processing your request",
        timestamp: new Date(),
        requestId,
        userId,
        rawError: error,
      }),
      { status: 500 },
    )
  }
}
