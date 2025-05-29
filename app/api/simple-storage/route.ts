// app/api/setup/storage-simple/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: "Service role key not configured",
        instructions: "Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables"
      }, { status: 500 })
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results = []

    // Try to create the 'assets' bucket (most commonly used)
    try {
      const { data: assetsData, error: assetsError } = await supabaseAdmin.storage.createBucket("assets", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          "image/jpeg", 
          "image/png", 
          "image/webp", 
          "image/gif",
          "image/svg+xml"
        ],
      })

      if (assetsError) {
        if (assetsError.message.includes('already exists')) {
          results.push({ bucket: 'assets', status: 'exists', message: 'Bucket already exists' })
        } else {
          results.push({ bucket: 'assets', status: 'error', message: assetsError.message })
        }
      } else {
        results.push({ bucket: 'assets', status: 'created', message: 'Successfully created' })
      }
    } catch (error: any) {
      results.push({ bucket: 'assets', status: 'error', message: error.message })
    }

    // List existing buckets to see what we have
    try {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
      
      if (!listError && buckets) {
        results.push({ 
          bucket: 'list', 
          status: 'info', 
          message: `Available buckets: ${buckets.map(b => b.name).join(', ')}` 
        })
      }
    } catch (error: any) {
      results.push({ bucket: 'list', status: 'error', message: error.message })
    }

    return NextResponse.json({
      success: true,
      message: "Storage setup completed",
      results,
      instructions: [
        "If you see 'row-level security policy' errors, you need to:",
        "1. Go to your Supabase dashboard",
        "2. Navigate to Storage > Policies",
        "3. Create a policy for the 'objects' table that allows INSERT and SELECT for authenticated users",
        "4. Or temporarily disable RLS on the storage.objects table for testing"
      ]
    })

  } catch (error: any) {
    console.error("Storage setup error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to setup storage",
      instructions: [
        "Make sure you have the correct SUPABASE_SERVICE_ROLE_KEY",
        "Check that your Supabase project is active",
        "Verify storage is enabled in your Supabase project"
      ]
    }, { status: 500 })
  }
}
