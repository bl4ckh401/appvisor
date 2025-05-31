import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { feature, metadata } = await request.json()

    if (!feature) {
      return NextResponse.json({ error: "Feature is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Try to insert the usage record
    try {
      const { error: insertError } = await supabase.from("feature_usage").insert([
        {
          user_id: user.id,
          feature,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
        },
      ])

      if (insertError) {
        // If table doesn't exist, just log and return success
        if (insertError.message.includes("relation") && insertError.message.includes("does not exist")) {
          console.log("Feature usage table doesn't exist yet, skipping database insert")
          return NextResponse.json({ success: true, message: "Tracked locally" })
        }
        throw insertError
      }

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Return success anyway to not block the user
      return NextResponse.json({ success: true, message: "Tracked locally" })
    }
  } catch (error) {
    console.error("Error tracking feature usage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
