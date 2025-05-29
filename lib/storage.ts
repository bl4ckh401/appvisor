import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Admin client for bucket operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Regular client for file operations
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Ensures storage buckets exist
 */
async function ensureBucketsExist() {
  try {
    // Check if mockups bucket exists
    const { data: mockupsBucket } = await supabaseAdmin.storage.getBucket("mockups")
    if (!mockupsBucket) {
      await supabaseAdmin.storage.createBucket("mockups", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      })
    }

    // Check if generated-images bucket exists
    const { data: generatedBucket } = await supabaseAdmin.storage.getBucket("generated-images")
    if (!generatedBucket) {
      await supabaseAdmin.storage.createBucket("generated-images", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      })
    }
  } catch (error) {
    console.log("Buckets may already exist or user lacks permissions:", error)
    // Continue execution - buckets might already exist
  }
}

/**
 * Uploads a file to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path The path within the bucket
 * @returns The URL of the uploaded file or an error
 */
export async function uploadToStorage(
  file: File | Blob,
  bucket = "generated-images",
  path?: string,
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Ensure buckets exist
    await ensureBucketsExist()

    // Generate a unique filename if path is not provided
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file instanceof File && file.name ? file.name.split(".").pop() : "png"

    const filePath = path || `${timestamp}-${randomId}.${extension}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Allow overwriting
    })

    if (error) {
      console.error("Storage upload error:", error)
      return { error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload file" }
  }
}

/**
 * Uploads a base64 image to storage
 */
export async function uploadBase64ToStorage(
  base64Data: string,
  bucket = "generated-images",
  filename?: string,
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Convert base64 to blob
    const response = await fetch(`data:image/png;base64,${base64Data}`)
    const blob = await response.blob()

    // Generate filename if not provided
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const filePath = filename || `generated-${timestamp}-${randomId}.png`

    return await uploadToStorage(blob, bucket, filePath)
  } catch (error) {
    console.error("Base64 upload error:", error)
    return { error: "Failed to upload base64 image" }
  }
}
