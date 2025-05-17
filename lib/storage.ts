import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Uploads a file to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path The path within the bucket
 * @returns The URL of the uploaded file or an error
 */
export async function uploadToStorage(
  file: File | Blob,
  bucket = "mockups",
  path?: string,
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    // Generate a unique filename if path is not provided
    const filePath = path || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
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
