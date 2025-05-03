import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Create error_logs table if it doesn't exist
    const { error } = await supabase.rpc("setup_error_logging")

    if (error) {
      console.error("Error setting up error logging:", error)
      return NextResponse.json({ error: "Failed to set up error logging" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Error logging set up successfully",
    })
  } catch (error) {
    console.error("Error in setup error logging:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
