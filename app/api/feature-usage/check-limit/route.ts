import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { planFeatures } from "@/lib/plan-restrictions-server"

export async function GET(request: NextRequest) {
  try {
    // Get feature from query params
    const { searchParams } = new URL(request.url)
    const feature = searchParams.get("feature")

    if (!feature) {
      return NextResponse.json({ error: "Feature parameter is required" }, { status: 400 })
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

    // Get limit for the feature based on plan
    const limit = planFeatures[plan][feature]

    // If unlimited
    if (limit === Number.POSITIVE_INFINITY) {
      return NextResponse.json({
        hasReachedLimit: false,
        limit: "unlimited",
      })
    }

    // Get current month's first day
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Query feature usage for current month
    const { data, error } = await supabase
      .from("feature_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("feature", feature)
      .gte("created_at", firstDayOfMonth.toISOString())

    if (error) {
      console.error("Error checking limit:", error)
      return NextResponse.json({ error: "Failed to check limit" }, { status: 500 })
    }

    // Calculate total usage
    let usage = 0
    if (data) {
      data.forEach((item) => {
        usage += item.count
      })
    }

    // Check if limit reached
    const hasReachedLimit = usage >= limit

    return NextResponse.json({
      hasReachedLimit,
      limit,
      used: usage,
    })
  } catch (error) {
    console.error("Error in feature usage limit check:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
