// app/api/feature-usage/count/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const feature = searchParams.get("feature")
    const since = searchParams.get("since")
    
    if (!feature) {
      return NextResponse.json({ error: "Feature parameter is required" }, { status: 400 })
    }
    
    // Build query
    let query = supabase
      .from("feature_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("feature", feature)
    
    if (since) {
      query = query.gte("timestamp", since)
    }
    
    const { data, error } = await query
    
    if (error) {
      // If table doesn't exist, return 0
      if (error.code === "42P01") {
        return NextResponse.json({ count: 0 })
      }
      
      console.error("Error fetching usage count:", error)
      return NextResponse.json({ count: 0 })
    }
    
    // Sum up the counts
    const totalCount = data?.reduce((sum, record) => sum + record.count, 0) || 0
    
    return NextResponse.json({ count: totalCount })
  } catch (error) {
    console.error("Error in usage count:", error)
    return NextResponse.json({ count: 0 })
  }
}
