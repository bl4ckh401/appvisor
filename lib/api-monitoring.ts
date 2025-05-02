import { logAPIError, generateRequestId, type APIErrorDetails } from "./error-monitoring"

// Interface for API monitoring options
interface APIMonitoringOptions {
  apiName: string
  endpoint: string
  userId?: string
}

// Interface for API call details
interface APICallDetails {
  startTime: Date
  endTime?: Date
  duration?: number
  status?: "success" | "failure"
  statusCode?: number
  requestId: string
}

// Track metrics for different API providers
const apiMetrics: Record<
  string,
  {
    calls: number
    successes: number
    failures: number
    avgDuration: number
    lastCalled?: Date
  }
> = {}

// Function to monitor API calls and handle errors
export async function monitorAPICall<T>(
  options: APIMonitoringOptions,
  apiCallFn: () => Promise<T>,
  payload?: any,
): Promise<T> {
  const requestId = generateRequestId()
  const callDetails: APICallDetails = {
    startTime: new Date(),
    requestId,
  }

  try {
    // Initialize metrics for this API if not exists
    if (!apiMetrics[options.apiName]) {
      apiMetrics[options.apiName] = {
        calls: 0,
        successes: 0,
        failures: 0,
        avgDuration: 0,
      }
    }

    // Update call count
    apiMetrics[options.apiName].calls++
    apiMetrics[options.apiName].lastCalled = new Date()

    // Log the API call attempt (could be expanded)
    console.log(`API CALL [${options.apiName}][${options.endpoint}] - RequestID: ${requestId}`)

    // Execute the actual API call
    const result = await apiCallFn()

    // Record success metrics
    callDetails.endTime = new Date()
    callDetails.status = "success"
    callDetails.duration = callDetails.endTime.getTime() - callDetails.startTime.getTime()

    // Update success metrics
    apiMetrics[options.apiName].successes++
    // Update average duration with running average formula
    const currentAvg = apiMetrics[options.apiName].avgDuration
    const totalCalls = apiMetrics[options.apiName].calls
    apiMetrics[options.apiName].avgDuration = (currentAvg * (totalCalls - 1) + callDetails.duration) / totalCalls

    // Log successful call details
    console.log(
      `API SUCCESS [${options.apiName}][${options.endpoint}] - ` +
        `RequestID: ${requestId} - Duration: ${callDetails.duration}ms`,
    )

    return result
  } catch (error: any) {
    // Record failure metrics
    callDetails.endTime = new Date()
    callDetails.status = "failure"
    callDetails.duration = callDetails.endTime.getTime() - callDetails.startTime.getTime()
    callDetails.statusCode = error.status || error.statusCode

    // Update failure metrics
    apiMetrics[options.apiName].failures++

    // Prepare detailed error information
    const errorDetails: APIErrorDetails = {
      apiName: options.apiName,
      endpoint: options.endpoint,
      statusCode: error.status || error.statusCode,
      errorMessage: error.message || "Unknown API error",
      errorCode: error.code || error.errorCode,
      timestamp: new Date(),
      requestId,
      userId: options.userId,
      requestPayload: payload,
      rawError: error,
    }

    // Log the error with our monitoring system
    await logAPIError(errorDetails)

    // Re-throw the error to be handled by the caller
    throw error
  }
}

// Function to get current API metrics
export function getAPIMetrics() {
  return { ...apiMetrics }
}

// Reset metrics (for testing or maintenance)
export function resetAPIMetrics() {
  Object.keys(apiMetrics).forEach((key) => {
    apiMetrics[key] = {
      calls: 0,
      successes: 0,
      failures: 0,
      avgDuration: 0,
    }
  })
}
