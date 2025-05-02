import { createClient } from "@/lib/supabase/server"
import { generateRequestId } from "@/lib/error-monitoring"

/**
 * Uploads a file to Supabase storage with enhanced error handling
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

  // 1. First check if the bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error(`Error listing buckets - RequestID: ${requestId}`, bucketsError)
    throw new Error(`Failed to list storage buckets: ${bucketsError.message}`)
  }

  const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

  if (!bucketExists) {
    console.log(`Bucket ${bucketName} does not exist, attempting to create - RequestID: ${requestId}`)

    // Try to create the bucket
    const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (createBucketError) {
      console.error(`Failed to create bucket ${bucketName} - RequestID: ${requestId}`, createBucketError)
      throw new Error(`Failed to create storage bucket: ${createBucketError.message}`)
    }

    console.log(`Successfully created bucket ${bucketName} - RequestID: ${requestId}`)
  }

  // 2. Ensure the directory structure exists by checking parent folders
  const dirPath = filePath.split("/").slice(0, -1).join("/")

  if (dirPath) {
    try {
      // This is just a check, we don't need to do anything with the result
      await supabase.storage.from(bucketName).list(dirPath)
    } catch (dirError) {
      console.log(`Directory structure may not exist: ${dirPath} - RequestID: ${requestId}`)
      // We'll continue anyway as the upload will create necessary paths
    }
  }

  // 3. Attempt the upload with detailed error handling
  console.log(`Uploading file (${fileBlob.size} bytes) to ${bucketName}/${filePath} - RequestID: ${requestId}`)

  const { data: uploadData, error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, fileBlob, {
    contentType,
    upsert: true, // Changed to true to overwrite if exists
  })

  if (uploadError) {
    // Log detailed error information
    console.error(`Upload failed - RequestID: ${requestId}`, {
      error: uploadError,
      errorCode: uploadError.code,
      errorMessage: uploadError.message,
      statusCode: uploadError.statusCode,
      details: uploadError.details,
    })

    throw new Error(
      `Storage upload failed: ${uploadError.message} (Code: ${uploadError.code}, Status: ${uploadError.statusCode})`,
    )
  }

  console.log(`Successfully uploaded to ${bucketName}/${filePath} - RequestID: ${requestId}`)

  // 4. Get the public URL
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    throw new Error(`Failed to get public URL for uploaded file: ${filePath}`)
  }

  return {
    path: uploadData?.path,
    publicUrl: urlData.publicUrl,
  }
}
