import { type NextRequest, NextResponse } from "next/server"
import { generateImageWithGPT } from "@/lib/openai-image"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { trackFeatureUsage } from "@/lib/usage-tracking"

// Mock planFeatures for testing purposes.  In a real application, this would likely be imported from a config file or database.
const planFeatures = {
  free: { gptImageGenerationsPerMonth: 5 },
  pro: { gptImageGenerationsPerMonth: 50 },
  team: { gptImageGenerationsPerMonth: Number.POSITIVE_INFINITY },
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { prompt, size, quality, format, background, outputCompression } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check usage limits
    const userId = session.user.id
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    const plan = subscription?.plan || "free"
    const limit = planFeatures[plan as "free" | "pro" | "team"].gptImageGenerationsPerMonth

    // Get current usage
    const { count, error } = await supabase
      .from("feature_usage")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("feature", "gpt_image_generation")
      .gte("timestamp", firstDayOfMonth.toISOString())

    // Check if user has reached their limit
    if (!error && typeof count === "number" && count >= limit && limit !== Number.POSITIVE_INFINITY) {
      return NextResponse.json(
        { error: `You've reached your monthly limit of ${limit} GPT image generations.` },
        { status: 403 },
      )
    }

    // Track feature usage
    await trackFeatureUsage("gpt_image_generation", {
      size,
      quality,
      prompt_length: prompt.length,
    })

    // Generate image
    console.log("Starting GPT image generation with prompt:", prompt.substring(0, 50) + "...")
    try {
      const result = await generateImageWithGPT({
        prompt,
        size,
        quality,
        format,
        background,
        outputCompression,
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      // Return the image URL
      return NextResponse.json({ url: result.url })
    } catch (error) {
      console.error("Error generating image with GPT Image:", error)
      return NextResponse.json(
        { error: error.message || "Failed to generate image. Please check server logs for details." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in GPT Image generation API:", error)
    return NextResponse.json(
      { error: "Failed to generate image. Please check server logs for details." },
      { status: 500 },
    )
  }
}
