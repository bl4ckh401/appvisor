import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"
import type { Database } from "@/lib/database.types"

// List of buckets needed by the application
const REQUIRED_BUCKETS = [
  {
    name: "assets",
    public: true,
    fileSizeLimit: 10485760, // 10MB
  },
  {
    name: "user-uploads",
    public: true,
    fileSizeLimit: 5242880, // 5MB
  },
]

export async function POST(request: Request) {
  const requestId = generateRequestId()
  console.log(`[${new Date().toISOString()}] Received POST /api/setup/storage - RequestID: ${requestId}`)

  // Authentication check
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "supabase",
        endpoint: "setup-storage",
        errorMessage: "Authentication required",
        timestamp: new Date(),
        requestId,
        rawError: sessionError,
      }),
      { status: 401 },
    )
  }

  // Only allow admin users to set up storage
  // You might want to implement a proper admin check here
  const userId = session.user.id

  try {
    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "supabase-storage",
          endpoint: "list-buckets",
          errorMessage: "Failed to list storage buckets",
          timestamp: new Date(),
          requestId,
          userId,
          rawError: listError,
        }),
        { status: 500 },
      )
    }

    const existingBucketNames = existingBuckets.map((bucket) => bucket.name)
    const results = []

    // Create missing buckets
    for (const bucket of REQUIRED_BUCKETS) {
      if (!existingBucketNames.includes(bucket.name)) {
        console.log(`Creating bucket: ${bucket.name} - RequestID: ${requestId}`)

        const { error: createError } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
        })

        if (createError) {
          results.push({
            bucket: bucket.name,
            status: "error",
            message: createError.message,
          })
        } else {
          results.push({
            bucket: bucket.name,
            status: "created",
          })
        }
      } else {
        results.push({
          bucket: bucket.name,
          status: "exists",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Storage setup completed",
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "supabase-storage",
        endpoint: "setup",
        errorMessage: "Failed to set up storage buckets",
        timestamp: new Date(),
        requestId,
        userId,
        rawError: error,
      }),
      { status: 500 },
    )
  }
}
