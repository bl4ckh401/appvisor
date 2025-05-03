import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getAPIMetrics } from "@/lib/api-monitoring"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the in-memory metrics
    const metrics = getAPIMetrics()

    // In a production app, you might want to supplement this with data from the database
    // For example, calculating success rates over time, etc.

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get metric data from request body
    const metricData = await request.json()

    if (!metricData.name) {
      return NextResponse.json({ error: "Metric name is required" }, { status: 400 })
    }

    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user if available
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Insert metric
    const { error } = await supabase.from("metrics").insert({
      user_id: user?.id || null,
      name: metricData.name,
      value: metricData.value || null,
      tags: metricData.tags || null,
      additional_data: metricData.additionalData || null,
    })

    if (error) {
      console.error("Error logging metric:", error)
      return NextResponse.json({ error: "Failed to log metric" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Metric logged successfully",
    })
  } catch (error) {
    console.error("Error in metrics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
