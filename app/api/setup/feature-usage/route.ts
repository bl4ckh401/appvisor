import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Create feature_usage table if it doesn't exist
    const { error } = await supabase.rpc("setup_feature_usage_tracking")

    if (error) {
      console.error("Error setting up feature usage tracking:", error)
      return NextResponse.json({ error: "Failed to set up feature usage tracking" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Feature usage tracking set up successfully",
    })
  } catch (error) {
    console.error("Error in setup feature usage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
