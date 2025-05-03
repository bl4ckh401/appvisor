import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { generateImage } from "@/lib/openai"
import { trackFeatureUsage } from "@/lib/usage-tracking"

export async function POST(request: NextRequest) {
  try {
    // Get prompt from request body
    const { prompt, size = "1024x1024", style = "vivid" } = await request.json()

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

    // Generate image
    const imageUrl = await generateImage(prompt, size, style)

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
    }

    // Track feature usage
    await trackFeatureUsage("image_generation", 1)

    // Return image URL
    return NextResponse.json({
      url: imageUrl,
      prompt,
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
