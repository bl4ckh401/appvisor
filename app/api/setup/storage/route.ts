import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Create storage buckets
    const buckets = ["mockups", "projects", "templates", "user-assets"]

    for (const bucket of buckets) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"],
      })

      if (error && error.message !== "Bucket already exists") {
        console.error(`Error creating bucket ${bucket}:`, error)
        return NextResponse.json({ error: `Failed to create bucket ${bucket}` }, { status: 500 })
      }
    }

    // Set up storage policies
    // This would typically be done in migrations or SQL setup

    return NextResponse.json({
      success: true,
      message: "Storage buckets set up successfully",
      buckets,
    })
  } catch (error) {
    console.error("Error in setup storage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
