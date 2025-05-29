// lib/supabase/storage-utils.ts
import { createClient } from "@/lib/supabase/server"
import { generateRequestId } from "@/lib/error-monitoring"

/**
 * Uploads a file to Supabase storage without trying to create buckets
 * Uses existing buckets only
 */
export async function uploadToStorage({
  bucketName,
  filePath,
  fileBlob,
  contentType,
  userId,
  requestId = generateRequestId(),
}: {
  bucketName: string
  filePath: string
  fileBlob: Blob
  contentType: string
  userId: string
  requestId?: string
}) {
  console.log(`Starting upload to ${bucketName}/${filePath} - RequestID: ${requestId}`)

  const supabase = createClient()

  try {
    // Try to upload directly to the specified bucket
    console.log(`Attempting upload to ${bucketName}/${filePath} - RequestID: ${requestId}`)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBlob, {
        contentType,
        upsert: true,
      })

    if (!uploadError) {
      // Success! Get the public URL
      console.log(`Successfully uploaded to ${bucketName}/${filePath} - RequestID: ${requestId}`)
      
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error(`Failed to get public URL for uploaded file: ${filePath}`)
      }

      return {
        path: uploadData?.path,
        publicUrl: urlData.publicUrl,
      }
    }

    // If the specified bucket doesn't work, try common bucket names
    const fallbackBuckets = ['assets', 'public', 'images', 'uploads']
    
    for (const fallbackBucket of fallbackBuckets) {
      if (fallbackBucket === bucketName) continue // Skip if it's the same bucket we already tried
      
      console.log(`Trying fallback bucket: ${fallbackBucket} - RequestID: ${requestId}`)
      
      // Preserve the original path structure
      const fallbackPath = bucketName === fallbackBucket ? filePath : `${bucketName}/${filePath}`
      
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from(fallbackBucket)
        .upload(fallbackPath, fileBlob, {
          contentType,
          upsert: true,
        })

      if (!fallbackError) {
        console.log(`Successfully uploaded to ${fallbackBucket}/${fallbackPath} - RequestID: ${requestId}`)
        
        const { data: urlData } = supabase.storage.from(fallbackBucket).getPublicUrl(fallbackPath)
        
        if (urlData?.publicUrl) {
          return {
            path: fallbackData?.path,
            publicUrl: urlData.publicUrl,
          }
        }
      }
    }

    // If all buckets failed, throw a descriptive error
    console.error(`All upload attempts failed - RequestID: ${requestId}`, {
      originalError: uploadError,
      bucketName,
      filePath,
    })

    throw new Error(`Failed to upload to any available bucket. Original error: ${uploadError.message}`)

  } catch (error: any) {
    console.error(`Storage upload error - RequestID: ${requestId}`, error)
    throw error
  }
}

/**
 * Simple upload function that uses the assets bucket with user folders
 */
export async function simpleUploadToStorage({
  filePath,
  fileBlob,
  contentType,
  userId,
  requestId = generateRequestId(),
}: {
  filePath: string
  fileBlob: Blob
  contentType: string
  userId: string
  requestId?: string
}) {
  console.log(`Simple upload starting - RequestID: ${requestId}`)

  const supabase = createClient()

  // Common bucket names to try (in order of preference)
  const bucketsToTry = ['assets', 'public', 'images', 'uploads', 'files']
  
  for (const bucketName of bucketsToTry) {
    try {
      // Create a user-specific path
      const fullPath = `users/${userId}/${filePath}`
      
      console.log(`Trying bucket: ${bucketName} with path: ${fullPath} - RequestID: ${requestId}`)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fullPath, fileBlob, {
          contentType,
          upsert: true,
        })

      if (!uploadError) {
        console.log(`Successfully uploaded to ${bucketName}/${fullPath} - RequestID: ${requestId}`)

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fullPath)

        if (urlData?.publicUrl) {
          return {
            path: uploadData.path,
            publicUrl: urlData.publicUrl,
          }
        }
      }
      
      console.log(`Failed to upload to ${bucketName}: ${uploadError?.message} - RequestID: ${requestId}`)
      
    } catch (bucketError: any) {
      console.log(`Error with bucket ${bucketName}: ${bucketError.message} - RequestID: ${requestId}`)
      continue
    }
  }

  // If all buckets failed, throw an error
  throw new Error(`Failed to upload to any available bucket. Please ensure at least one storage bucket exists in your Supabase project.`)
}

/**
 * Check what buckets are available (for debugging)
 */
export async function listAvailableBuckets(requestId = generateRequestId()) {
  console.log(`Checking available buckets - RequestID: ${requestId}`)
  
  const supabase = createClient()
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error(`Error listing buckets - RequestID: ${requestId}`, error)
      return []
    }
    
    console.log(`Available buckets: ${buckets.map(b => b.name).join(', ')} - RequestID: ${requestId}`)
    return buckets.map(b => b.name)
    
  } catch (error: any) {
    console.error(`Failed to list buckets - RequestID: ${requestId}`, error)
    return []
  }
}
