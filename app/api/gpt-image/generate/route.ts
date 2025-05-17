import { NextResponse } from "next/server"
import { generateImageWithGPT } from "@/lib/openai-image"
import { trackFeatureUsage } from "@/lib/usage-tracking"

// Ensure this runs on the server
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { prompt, size, quality, format } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Map UI quality values to DALL-E supported values
    const mappedQuality = quality === "high" ? "hd" : "standard"

    // Generate the image
    const result = await generateImageWithGPT({
      prompt,
      size,
      quality: mappedQuality,
      format,
    })

    if (!result.success) {
      console.error("OpenAI image generation failed:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Track feature usage on the server side
    try {
      await trackFeatureUsage("gpt_image_generation", {
        quality,
        size,
        format,
      })
    } catch (trackingError) {
      // Log but don't fail the request if tracking fails
      console.error("Failed to track feature usage:", trackingError)
    }

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error("Error in GPT image generation route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
