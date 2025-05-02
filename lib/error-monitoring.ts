import { createClient } from "@/lib/supabase/server"

// Types for error monitoring
export interface APIErrorDetails {
  apiName: string // Which API (e.g., "openai", "gemini")
  endpoint: string // Specific endpoint called
  statusCode?: number // HTTP status code (if available)
  errorMessage: string // Human-readable error message
  errorCode?: string // Error code (if provided by the API)
  timestamp: Date // When the error occurred
  requestId?: string // Request ID (if available)
  userId?: string // User who initiated the request (if authenticated)
  requestPayload?: any // A sanitized/redacted version of the request (no sensitive data)
  rawError?: any // The raw error object (for developer debugging)
}

// Core function to log API errors
export async function logAPIError(error: APIErrorDetails): Promise<void> {
  try {
    // Format the error details for console logging
    const formattedError = {
      ...error,
      timestamp: error.timestamp.toISOString(),
      requestPayload: error.requestPayload
        ? JSON.stringify(sanitizePayload(error.requestPayload)).substring(0, 500)
        : undefined,
      rawError: error.rawError
        ? typeof error.rawError === "string"
          ? error.rawError.substring(0, 1000)
          : JSON.stringify(error.rawError).substring(0, 1000)
        : undefined,
    }

    // Log to console with a clear format
    console.error(`API ERROR [${error.apiName}][${error.endpoint}]:`, formattedError)

    // Try to store in Supabase
    try {
      const supabase = createClient()

      const { data, error: dbError } = await supabase.from("api_error_logs").insert([
        {
          api_name: error.apiName,
          endpoint: error.endpoint,
          status_code: error.statusCode,
          error_message: error.errorMessage,
          error_code: error.errorCode,
          timestamp: error.timestamp,
          request_id: error.requestId,
          user_id: error.userId,
          request_payload: error.requestPayload ? sanitizePayload(error.requestPayload) : null,
          raw_error: error.rawError
            ? typeof error.rawError === "string"
              ? error.rawError.substring(0, 3000)
              : JSON.stringify(error.rawError).substring(0, 3000)
            : null,
        },
      ])

      if (dbError) {
        // If the table doesn't exist yet, just log to console
        if (dbError.code === "42P01") {
          // PostgreSQL code for undefined_table
          console.warn("Error logs table does not exist yet. Logging to console only.")
        } else {
          console.error("Failed to log API error to database:", dbError)
        }
      }
    } catch (storageError) {
      console.error("Error storing API error in database:", storageError)
    }
  } catch (loggingError) {
    // Failsafe: If our error logging itself fails, at least output something to console
    console.error("Error in error logging system:", loggingError)
    console.error("Original error:", error)
  }
}

// Helper function to sanitize sensitive data from payloads before logging
function sanitizePayload(payload: any): any {
  // Clone the payload to avoid mutating the original
  const sanitized = JSON.parse(JSON.stringify(payload))

  // List of keys that might contain sensitive information
  const sensitiveKeys = [
    "apiKey",
    "key",
    "secret",
    "password",
    "token",
    "authorization",
    "accessToken",
    "refreshToken",
    "credential",
  ]

  // Recursive function to sanitize an object
  function sanitizeObject(obj: any) {
    if (!obj || typeof obj !== "object") return

    Object.keys(obj).forEach((key) => {
      // Check if the key is sensitive
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
        obj[key] = "[REDACTED]"
      }
      // Recurse into nested objects and arrays
      else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key])
      }
    })
  }

  sanitizeObject(sanitized)
  return sanitized
}

// Function to create a consistent error response object
export function createErrorResponse(errorDetails: APIErrorDetails) {
  // Log the error first
  logAPIError(errorDetails)

  // Return a standardized error response
  return {
    error: errorDetails.errorMessage,
    errorCode: errorDetails.errorCode || "UNKNOWN_ERROR",
    timestamp: errorDetails.timestamp.toISOString(),
    requestId: errorDetails.requestId,
  }
}

// Helper to generate a request ID
export function generateRequestId(): string {
  return `req_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`
}
