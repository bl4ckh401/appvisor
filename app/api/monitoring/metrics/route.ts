import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getAPIMetrics } from "@/lib/api-monitoring"

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
