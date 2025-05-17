import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
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
  
  // Use the cookieStore for server-side authenticated requests
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  try {
    // Skip bucket creation - assume bucket already exists
    // This avoids RLS policy issues with bucket creation
    
    // Attempt the upload with detailed error handling
    console.log(`Uploading file (${fileBlob.size} bytes) to ${bucketName}/${filePath} - RequestID: ${requestId}`)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBlob, {
        contentType,
        upsert: true,
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
        `Storage upload failed: ${uploadError.message} (Code: ${uploadError.code}, Status: ${uploadError.statusCode})`
      )
    }
    
    console.log(`Successfully uploaded to ${bucketName}/${filePath} - RequestID: ${requestId}`)
    
    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    
    if (!urlData?.publicUrl) {
      throw new Error(`Failed to get public URL for uploaded file: ${filePath}`)
    }
    
    return {
      path: uploadData?.path,
      publicUrl: urlData.publicUrl,
    }
  } catch (error: any) {
    console.error(`Storage operation failed - RequestID: ${requestId}`, error)
    throw error
  }
}
