import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
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

    // Get current month's first day
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Query feature usage for current month
    const { data, error } = await supabase
      .from("feature_usage")
      .select("feature, count")
      .eq("user_id", user.id)
      .gte("created_at", firstDayOfMonth.toISOString())

    if (error) {
      console.error("Error getting usage stats:", error)
      return NextResponse.json({ error: "Failed to get usage stats" }, { status: 500 })
    }

    // Aggregate usage by feature
    const stats: Record<string, number> = {}

    if (data) {
      data.forEach((item) => {
        if (!stats[item.feature]) {
          stats[item.feature] = 0
        }
        stats[item.feature] += item.count
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in feature usage stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
