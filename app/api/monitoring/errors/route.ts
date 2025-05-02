import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
    const apiName = searchParams.get("api")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build the query
    let query = supabase.from("api_error_logs").select("*").order("timestamp", { ascending: false })

    // Apply filters if provided
    if (apiName) {
      query = query.eq("api_name", apiName)
    }

    if (startDate) {
      query = query.gte("timestamp", startDate)
    }

    if (endDate) {
      query = query.lte("timestamp", endDate)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching error logs:", error)

      // If the table doesn't exist yet, return an empty array
      if (error.code === "42P01") {
        // PostgreSQL code for undefined_table
        return NextResponse.json({
          data: [],
          count: 0,
          message: "Error logs table does not exist yet. Please set it up first.",
        })
      }

      return NextResponse.json({ error: "Failed to fetch error logs" }, { status: 500 })
    }

    return NextResponse.json({ data, count })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
