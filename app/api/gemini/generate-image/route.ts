import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { generateImageWithGemini } from "@/lib/google-ai"
import { trackFeatureUsage } from "@/lib/usage-tracking"

export async function POST(request: NextRequest) {
  try {
    // Get prompt from request body
    const { prompt, size = "1024x1024" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
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

    // Generate image with Gemini
    const imageUrl = await generateImageWithGemini(prompt, size)

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image with Gemini" }, { status: 500 })
    }

    // Track feature usage
    await trackFeatureUsage("gemini_image_generation", 1)

    // Return image URL
    return NextResponse.json({
      url: imageUrl,
      prompt,
    })
  } catch (error) {
    console.error("Error generating image with Gemini:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
