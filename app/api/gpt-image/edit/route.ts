import { type NextRequest, NextResponse } from "next/server"
import { editImageWithGPT } from "@/lib/openai-image"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { trackFeatureUsage } from "@/lib/usage-tracking"

// Mark this file as server-side only
export const runtime = "nodejs" // 'edge' or 'nodejs'

// Mock planFeatures for testing purposes
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

    // Get form data
    const formData = await request.formData()
    const prompt = formData.get("prompt") as string
    const size = formData.get("size") as string
    const quality = formData.get("quality") as string
    const format = formData.get("format") as string
    const background = formData.get("background") as string
    const outputCompression = formData.get("outputCompression")
      ? Number.parseInt(formData.get("outputCompression") as string)
      : undefined

    // Get image files
    const imageFiles: File[] = []
    if (formData.has("image")) {
      const image = formData.get("image")
      if (image instanceof File) {
        imageFiles.push(image)
      }
    }

    // Handle multiple images if present
    let i = 0
    while (formData.has(`image[${i}]`)) {
      const image = formData.get(`image[${i}]`)
      if (image instanceof File) {
        imageFiles.push(image)
      }
      i++
    }

    // Get mask if present
    const mask = formData.get("mask") as File | null

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
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
      .eq("feature", "gpt_image_editing")
      .gte("timestamp", firstDayOfMonth.toISOString())

    // Check if user has reached their limit
    if (!error && typeof count === "number" && count >= limit && limit !== Number.POSITIVE_INFINITY) {
      return NextResponse.json(
        { error: `You've reached your monthly limit of ${limit} GPT image edits.` },
        { status: 403 },
      )
    }

    // Track feature usage
    await trackFeatureUsage("gpt_image_editing", {
      size,
      quality,
      prompt_length: prompt.length,
      has_mask: !!mask,
    })

    // Edit image
    console.log("Starting GPT image editing with prompt:", prompt.substring(0, 50) + "...")
    try {
      const result = await editImageWithGPT({
        prompt,
        image: imageFiles.length === 1 ? imageFiles[0] : imageFiles,
        mask: mask || undefined,
        size: size as any,
        quality: quality as any,
        format: format as any,
        background: background as any,
        outputCompression,
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      // Return the image URL
      return NextResponse.json({ url: result.url })
    } catch (error: any) {
      console.error("Error editing image with GPT Image:", error)
      return NextResponse.json(
        { error: error.message || "Failed to edit image. Please check server logs for details." },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in GPT Image editing API:", error)
    return NextResponse.json({ error: "Failed to edit image. Please check server logs for details." }, { status: 500 })
  }
}
