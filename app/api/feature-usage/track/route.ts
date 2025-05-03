import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { feature, count = 1 } = await request.json()

    if (!feature) {
      return NextResponse.json({ error: "Feature key is required" }, { status: 400 })
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

    // Insert usage record
    const { error } = await supabase.from("feature_usage").insert({
      user_id: user.id,
      feature,
      count,
    })

    if (error) {
      console.error("Error tracking feature usage:", error)
      return NextResponse.json({ error: "Failed to track feature usage" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in feature usage tracking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
