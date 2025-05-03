import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { generateImageWithGemini } from "@/lib/google-ai"
import { trackFeatureUsage } from "@/lib/usage-tracking"

export async function POST(request: NextRequest) {
  try {
    // Get mockup details from request body
    const { appName, appDescription, appType, colorScheme, style, deviceType = "mobile" } = await request.json()

    if (!appName || !appDescription || !appType) {
      return NextResponse.json({ error: "App name, description, and type are required" }, { status: 400 })
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

    // Generate prompt for the app mockup
    const prompt = generateAppMockupPrompt(appName, appDescription, appType, colorScheme, style, deviceType)

    // Generate image with Gemini
    const imageUrl = await generateImageWithGemini(prompt, "1024x1024")

    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate mockup with Gemini" }, { status: 500 })
    }

    // Save mockup to database
    const { data: mockup, error } = await supabase
      .from("mockups")
      .insert({
        user_id: user.id,
        name: appName,
        description: appDescription,
        app_type: appType,
        color_scheme: colorScheme,
        style,
        device_type: deviceType,
        image_url: imageUrl,
        prompt,
        provider: "gemini",
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving mockup:", error)
      return NextResponse.json({ error: "Failed to save mockup" }, { status: 500 })
    }

    // Track feature usage
    await trackFeatureUsage("mockup_generation", 1)
    await trackFeatureUsage("gemini_mockup_generation", 1)

    // Return mockup data
    return NextResponse.json({
      mockup,
      imageUrl,
    })
  } catch (error) {
    console.error("Error generating app mockup with Gemini:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to generate a prompt for the app mockup
function generateAppMockupPrompt(
  appName: string,
  appDescription: string,
  appType: string,
  colorScheme: string,
  style: string,
  deviceType: string,
): string {
  let deviceFrame = ""

  if (deviceType === "mobile") {
    deviceFrame = "modern smartphone"
  } else if (deviceType === "tablet") {
    deviceFrame = "tablet device"
  } else if (deviceType === "desktop") {
    deviceFrame = "desktop monitor"
  }

  return `Create a professional ${style} app mockup for "${appName}", a ${appType} app, displayed on a ${deviceFrame}. The app should have a ${colorScheme} color scheme. The app's purpose is: ${appDescription}. The mockup should be photorealistic, high quality, and showcase the app's main screen with appropriate UI elements.`
}
