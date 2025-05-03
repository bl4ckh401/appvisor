import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { generateImage } from "@/lib/openai"
import { generateImageWithGemini } from "@/lib/google-ai"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import { planFeatures } from "@/lib/plan-restrictions-server"

export async function POST(request: NextRequest) {
  try {
    // Get bulk generation details from request body
    const { prompts, provider = "openai", size = "1024x1024", style = "vivid" } = await request.json()

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: "At least one prompt is required" }, { status: 400 })
    }

    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    // Determine user's plan
    const plan = subscription?.plan || "free"

    // Check bulk generation limit
    const bulkLimit = planFeatures[plan].bulkGeneration

    if (prompts.length > bulkLimit) {
      return NextResponse.json(
        {
          error: `Your plan allows a maximum of ${bulkLimit} prompts in bulk generation`,
          limit: bulkLimit,
        },
        { status: 400 },
      )
    }

    // Generate images
    const results = []

    for (const prompt of prompts) {
      try {
        let imageUrl

        if (provider === "gemini") {
          imageUrl = await generateImageWithGemini(prompt, size)
        } else {
          imageUrl = await generateImage(prompt, size, style)
        }

        if (imageUrl) {
          results.push({
            prompt,
            url: imageUrl,
            success: true,
          })
        } else {
          results.push({
            prompt,
            success: false,
            error: "Failed to generate image",
          })
        }
      } catch (error) {
        console.error(`Error generating image for prompt "${prompt}":`, error)
        results.push({
          prompt,
          success: false,
          error: "Error generating image",
        })
      }
    }

    // Track feature usage
    await trackFeatureUsage("bulk_generation", prompts.length)

    // Return results
    return NextResponse.json({
      results,
      total: prompts.length,
      successful: results.filter((r) => r.success).length,
    })
  } catch (error) {
    console.error("Error in bulk generation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
