import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "Service role key not configured" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create mockups bucket
    const { data: mockupsBucket, error: mockupsError } = await supabaseAdmin.storage.createBucket("mockups", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    })

    // Create generated-images bucket
    const { data: generatedBucket, error: generatedError } = await supabaseAdmin.storage.createBucket(
      "generated-images",
      {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
    )

    return NextResponse.json({
      success: true,
      buckets: {
        mockups: mockupsBucket ? "created" : mockupsError?.message || "exists",
        generatedImages: generatedBucket ? "created" : generatedError?.message || "exists",
      },
    })
  } catch (error: any) {
    console.error("Storage setup error:", error)
    return NextResponse.json({ error: error.message || "Failed to setup storage" }, { status: 500 })
  }
}
