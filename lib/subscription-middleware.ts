// lib/subscription-middleware.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { planFeatures } from "@/lib/plan-restrictions"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"

type FeatureRequirement = keyof typeof planFeatures.free
type RequiredPlan = "free" | "pro" | "team"

// Helper function to check if plan meets requirements
function planMeetsRequirement(requiredPlan: RequiredPlan, actualPlan: string): boolean {
  if (requiredPlan === "free") return true
  if (requiredPlan === "pro") return actualPlan === "pro" || actualPlan === "team"
  if (requiredPlan === "team") return actualPlan === "team"
  return false
}

// Check if a feature is available in a plan
function hasFeatureAccess(feature: FeatureRequirement, plan: string): boolean {
  const planKey = plan as RequiredPlan
  
  if (!planFeatures[planKey]) return false

  // For numeric features (check if higher than free)
  if (typeof planFeatures[planKey][feature] === "number") {
    return planFeatures[planKey][feature] > planFeatures.free[feature]
  }
  
  // For boolean features
  if (typeof planFeatures[planKey][feature] === "boolean") {
    return planFeatures[planKey][feature] === true
  }
  
  // For array features (check if length is greater)
  if (Array.isArray(planFeatures[planKey][feature])) {
    return planFeatures[planKey][feature].length > planFeatures.free[feature].length
  }
  
  // For other types
  return planFeatures[planKey][feature] !== planFeatures.free[feature]
}

// Check if a user has reached their monthly mockup limit
async function hasReachedMockupLimit(supabase: any, userId: string, plan: string): Promise<boolean> {
  // If unlimited mockups
  if (planFeatures[plan as RequiredPlan].mockupsPerMonth === Number.POSITIVE_INFINITY) {
    return false
  }
  
  // Calculate first day of current month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Count mockups created this month
  const { count, error } = await supabase
    .from("mockups")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .gte("created_at", firstDayOfMonth.toISOString())
  
  if (error) {
    console.error("Error checking mockup limit:", error)
    return false // Let it pass if there's an error
  }
  
  // Get the limit based on plan
  const limit = planFeatures[plan as RequiredPlan].mockupsPerMonth
  
  return typeof count === "number" && count >= limit
}

// Middleware to check subscription requirements
export async function checkSubscription(
  requiredPlan: RequiredPlan = "free",
  requiredFeature?: FeatureRequirement
) {
  const requestId = generateRequestId()
  
  return async (req: Request) => {
    try {
      // Setup Supabase client
      const supabase = createRouteHandlerClient({ cookies })
      
      // 1. Check authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        return NextResponse.json(
          createErrorResponse({
            apiName: "subscription",
            endpoint: "check",
            errorMessage: "Authentication required",
            timestamp: new Date(),
            requestId,
          }),
          { status: 401 }
        )
      }
      
      const userId = session.user.id
      
      // 2. Get user's subscription
      const { data: subscription, error: subError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single()
      
      // Handle errors and no subscription
      if (subError && subError.code !== "PGRST116") {
        console.error(`Error fetching subscription: ${subError.message} - RequestID: ${requestId}`)
      }
      
      // 3. Determine user's plan
      const userPlan = subscription?.plan || "free"
      
      // 4. Check if the user's plan meets the requirements
      const hasSufficientPlan = planMeetsRequirement(requiredPlan, userPlan)
      
      if (!hasSufficientPlan) {
        return NextResponse.json(
          createErrorResponse({
            apiName: "subscription",
            endpoint: "check",
            errorMessage: `This feature requires a ${requiredPlan} plan or higher`,
            timestamp: new Date(),
            requestId,
            userId,
          }),
          { status: 403 }
        )
      }
      
      // 5. If a specific feature is required, check access
      if (requiredFeature) {
        const hasFeature = hasFeatureAccess(requiredFeature, userPlan)
        
        if (!hasFeature) {
          return NextResponse.json(
            createErrorResponse({
              apiName: "subscription",
              endpoint: "check",
              errorMessage: `This feature requires a plan with ${requiredFeature} access`,
              timestamp: new Date(),
              requestId,
              userId,
            }),
            { status: 403 }
          )
        }
        
        // 6. Check usage limits if applicable
        if (requiredFeature === "mockupsPerMonth") {
          const reachedLimit = await hasReachedMockupLimit(supabase, userId, userPlan)
          
          if (reachedLimit) {
            return NextResponse.json(
              createErrorResponse({
                apiName: "subscription",
                endpoint: "check",
                errorMessage: "You have reached your monthly mockup limit",
                timestamp: new Date(),
                requestId,
                userId,
              }),
              { status: 403 }
            )
          }
        }
      }
      
      // If all checks pass, add user info to the request context
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set("x-user-id", userId)
      requestHeaders.set("x-user-plan", userPlan)
      requestHeaders.set("x-request-id", requestId)
      
      // Continue with the modified request
      const modifiedRequest = new Request(req.url, {
        headers: requestHeaders,
        method: req.method,
        body: req.body,
        redirect: req.redirect,
        signal: req.signal,
      })
      
      return modifiedRequest
    } catch (error) {
      console.error(`Subscription check error: ${error} - RequestID: ${requestId}`)
      
      return NextResponse.json(
        createErrorResponse({
          apiName: "subscription",
          endpoint: "check",
          errorMessage: "Error checking subscription",
          timestamp: new Date(),
          requestId,
          rawError: error,
        }),
        { status: 500 }
      )
    }
  }
}

// Usage example in API route:
/*
import { checkSubscription } from "@/lib/subscription-middleware"

export async function POST(req: Request) {
  // Apply subscription middleware for a feature requiring a pro plan
  const modifiedReq = await checkSubscription("pro", "bulkGeneration")(req)
  
  // If modifiedReq is a Response, it means the middleware returned an error
  if (modifiedReq instanceof Response) {
    return modifiedReq
  }
  
  // Otherwise, continue with the request
  const userId = modifiedReq.headers.get("x-user-id")
  const userPlan = modifiedReq.headers.get("x-user-plan")
  const requestId = modifiedReq.headers.get("x-request-id")
  
  // Process request...
}
*/
