// lib/mockup-limit-middleware.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { planFeatures } from "@/lib/plan-restrictions"

export async function checkMockupLimit() {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      allowed: false,
      error: "Unauthorized",
      statusCode: 401
    }
  }
  
  const userId = session.user.id
  
  // Get user's subscription
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()
  
  const plan = subscription?.plan || "free"
  const limit = planFeatures[plan].mockupsPerMonth
  
  // If unlimited (pro/team plans)
  if (limit === Number.POSITIVE_INFINITY) {
    return { allowed: true }
  }
  
  // For free plan, check current month's usage
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Count mockups from feature_usage table
  const { data: usageData, error: usageError } = await supabase
    .from("feature_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", "mockup_generation")
    .gte("timestamp", firstDayOfMonth.toISOString())
  
  if (usageError) {
    console.error("Error checking mockup usage:", usageError)
    // If we can't check usage, allow the request but log it
    return { allowed: true }
  }
  
  // Sum up the usage
  const totalUsage = usageData?.reduce((sum, record) => sum + record.count, 0) || 0
  
  if (totalUsage >= limit) {
    return {
      allowed: false,
      error: `You've reached your monthly limit of ${limit} mockups. Upgrade to Pro for unlimited mockups.`,
      statusCode: 403,
      usage: totalUsage,
      limit: limit
    }
  }
  
  return {
    allowed: true,
    usage: totalUsage,
    limit: limit,
    remaining: limit - totalUsage
  }
}

// Wrapper function to apply the middleware
export function withMockupLimit(handler: Function) {
  return async (request: Request) => {
    const limitCheck = await checkMockupLimit()
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.error,
          usage: limitCheck.usage,
          limit: limitCheck.limit
        },
        { status: limitCheck.statusCode || 403 }
      )
    }
    
    // Add usage info to request headers for the handler to use
    const headers = new Headers(request.headers)
    headers.set("x-mockup-usage", String(limitCheck.usage || 0))
    headers.set("x-mockup-limit", String(limitCheck.limit || 5))
    headers.set("x-mockup-remaining", String(limitCheck.remaining || 0))
    
    const modifiedRequest = new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      redirect: request.redirect
    })
    
    return handler(modifiedRequest)
  }
}
