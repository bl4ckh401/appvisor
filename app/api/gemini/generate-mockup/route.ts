import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { monitorAPICall } from "@/lib/api-monitoring"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"
import { generateContentWithGemini, generateImageWithImagen } from "@/lib/google-ai"
import type { Database } from "@/lib/database.types"

// --- Constants ---
const SUPABASE_BUCKET_NAME = "assets"

export async function POST(request: Request) {
  const requestId = generateRequestId()
  console.log(`[${new Date().toISOString()}] Received POST /api/gemini/generate-mockup - RequestID: ${requestId}`)

  // 1. Check API key configuration
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-mockup",
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
        endpoint: "generate-mockup",
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
        endpoint: "generate-mockup",
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
        endpoint: "generate-mockup",
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
      screenshot: body.screenshot ? "SCREENSHOT_DATA_PROVIDED" : "NO_SCREENSHOT",
      prompt: body.prompt ? `${body.prompt.substring(0, 50)}...` : "[Not Provided]",
      caption: body.caption ? `${body.caption.substring(0, 50)}...` : "[Not Provided]",
    }),
  )

  const { screenshot, caption, backgroundColor, style, prompt: userPrompt } = body

  // 4. Validate request parameters
  if (!caption || typeof caption !== "string" || caption.trim().length === 0) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-mockup",
        errorMessage: "Caption is required",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  if (!backgroundColor || typeof backgroundColor !== "string" || backgroundColor.trim().length === 0) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-mockup",
        errorMessage: "Background color is required",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  if (!style || (style !== "gradient" && style !== "solid")) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-mockup",
        errorMessage: "Style must be either 'gradient' or 'solid'",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  if (caption.length > 100) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-mockup",
        errorMessage: "Caption is too long (max 100 characters)",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  // Process screenshot if provided
  let screenshotBase64: string | null = null
  if (screenshot) {
    if (!screenshot.startsWith("data:image/") || !screenshot.includes(";base64,")) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "gemini",
          endpoint: "generate-mockup",
          errorMessage: "Invalid screenshot format. Expected data URL (e.g., data:image/png;base64,...)",
          timestamp: new Date(),
          requestId,
          userId,
        }),
        { status: 400 },
      )
    }
    try {
      screenshotBase64 = screenshot.split(",")[1]
      if (!screenshotBase64 || screenshotBase64.length === 0) throw new Error("Empty base64 data")
      Buffer.from(screenshotBase64, "base64") // Validate base64
    } catch (e) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "gemini",
          endpoint: "generate-mockup",
          errorMessage: "Invalid base64 data in screenshot",
          timestamp: new Date(),
          requestId,
          userId,
          rawError: e,
        }),
        { status: 400 },
      )
    }
  }

  try {
    // 5. Generate the mockup
    // Construct detailed prompt
    const detailedPrompt = `
      Generate a professional app store screenshot mockup image based on the following details:

      - **Primary Goal:** Create a visually appealing marketing image suitable for an app store listing (like Apple App Store or Google Play Store).
      - **Caption Text:** Display the text "${caption}" prominently, likely at the top or bottom, using clear, readable font (e.g., white or black depending on background contrast).
      - **Background Style:** Use a ${style} background.
      - **Background Color:** The primary color for the background should be based on ${backgroundColor}. If the style is 'gradient', create a subtle, professional gradient using this color. If 'solid', use the color directly.
      ${screenshotBase64 ? `- **App Screenshot:** Incorporate the provided app screenshot image centrally within the mockup. Ensure it looks naturally placed.` : "- **Placeholder:** Since no specific app screenshot was provided, use a generic but professional-looking placeholder UI element where an app screenshot would normally go."}
      - **Overall Aesthetics:** The final image must look polished, modern, and high-quality. Avoid overly complex or distracting elements. Focus on clarity and professionalism.

      Output only the generated image. Do not include any explanatory text before or after the image.
    `

    console.log(`Initiating mockup generation for user ${userId} - RequestID: ${requestId}`)

    // First try with Gemini 2.0 Flash
    let generationResult = await monitorAPICall(
      {
        apiName: "gemini",
        endpoint: "generate-mockup",
        userId,
      },
      async () => {
        return await generateContentWithGemini(detailedPrompt, screenshotBase64 || undefined)
      },
      {
        prompt: detailedPrompt.substring(0, 50) + "...", // Only log part of the prompt
        hasScreenshot: !!screenshotBase64,
      },
    )

    // If Gemini fails, fall back to Imagen 3
    if (!generationResult.success || !generationResult.imageBytes) {
      console.log(`Gemini 2.0 Flash failed, falling back to Imagen 3 - RequestID: ${requestId}`)

      generationResult = await monitorAPICall(
        {
          apiName: "imagen",
          endpoint: "generate-mockup-fallback",
          userId,
        },
        async () => {
          return await generateImageWithImagen(detailedPrompt, "1:1")
        },
        {
          prompt: detailedPrompt.substring(0, 50) + "...", // Only log part of the prompt
        },
      )
    }

    if (!generationResult.success || !generationResult.imageBytes) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "gemini",
          endpoint: "generate-mockup",
          errorMessage: `Failed to generate mockup: ${generationResult.error || "Unknown reason"}`,
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

      console.log(`Generated mockup blob size: ${imageBlob.size} bytes - RequestID: ${requestId}`)
      if (imageBlob.size === 0) {
        throw new Error("Generated image data resulted in an empty blob")
      }

      const timestamp = Date.now()
      const fileName = `generated-mockups/${userId}/gemini-mockup-${timestamp}-${requestId.slice(0, 8)}.png`

      console.log(
        `Attempting to upload mockup to Supabase storage: ${SUPABASE_BUCKET_NAME}/${fileName} - RequestID: ${requestId}`,
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
    console.log(`Successfully completed mockup generation request - RequestID: ${requestId}`)
    return NextResponse.json({
      url: publicUrl, // This will be null if storage failed
      imageData: `data:image/png;base64,${imageBytesBase64}`, // Always include the image data
      requestId,
      provider: "gemini",
      storageError: storageError ? storageError.message : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "gemini",
        endpoint: "generate-mockup",
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
