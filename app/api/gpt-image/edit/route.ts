import { type NextRequest, NextResponse } from "next/server"
import { editImageWithGPT } from "@/lib/openai-image"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import { planFeatures } from "@/lib/plans"

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

    // This endpoint expects multipart/form-data
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

    // Check if we have multiple images or a single image
    if (formData.getAll("image").length > 1) {
      formData.getAll("image").forEach((file) => {
        if (file instanceof File) {
          imageFiles.push(file)
        }
      })
    } else {
      const image = formData.get("image")
      if (image instanceof File) {
        imageFiles.push(image)
      }
    }

    // Get mask if provided
    const mask = formData.get("mask") as File | null

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    // Track feature usage
    await trackFeatureUsage("gpt_image_editing", {
      size,
      quality,
      prompt_length: prompt.length,
      image_count: imageFiles.length,
      has_mask: !!mask,
    })

    // Edit image
    const result = await editImageWithGPT({
      prompt,
      image: imageFiles.length === 1 ? imageFiles[0] : imageFiles,
      mask: mask || undefined,
      size: (size as any) || undefined,
      quality: (quality as any) || undefined,
      format: (format as any) || undefined,
      background: (background as any) || undefined,
      outputCompression,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Return the image URL
    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error("Error in GPT Image editing API:", error)
    return NextResponse.json({ error: "Failed to edit image. Please check server logs for details." }, { status: 500 })
  }
}
