// lib/usage-tracking.ts
import { createClient } from "@/lib/supabase/client"
import { planFeatures } from "@/lib/plan-restrictions"

// Feature types that can be tracked
type TrackableFeature = "mockup_generation" | "bulk_generation" | "export" | "api_call"

// Interface for tracking usage
interface UsageTracking {
  user_id: string
  feature: TrackableFeature
  count: number
  timestamp: string
  metadata?: Record<string, any>
}

// Track feature usage
export async function trackFeatureUsage(
  feature: TrackableFeature,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("Cannot track usage: No authenticated user")
      return false
    }
    
    // Insert usage record
    const { error } = await supabase.from("feature_usage").insert({
      user_id: user.id,
      feature,
      count: 1,
      timestamp: new Date().toISOString(),
      metadata
    })
    
    if (error) {
      // If table doesn't exist, create it
      if (error.code === "42P01") {
        await createUsageTrackingTable(supabase)
        
        // Try again after creating the table
        const { error: retryError } = await supabase.from("feature_usage").insert({
          user_id: user.id,
          feature,
          count: 1,
          timestamp: new Date().toISOString(),
          metadata
        })
        
        if (retryError) {
          console.error("Error recording feature usage after table creation:", retryError)
          return false
        }
      } else {
        console.error("Error recording feature usage:", error)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error("Error tracking feature usage:", error)
    return false
  }
}

// Create usage tracking table if it doesn't exist
async function createUsageTrackingTable(supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("pgcrypto_execute", {
      query: `
        CREATE TABLE IF NOT EXISTS feature_usage (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          feature TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 1,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          metadata JSONB
        );
        
        CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
        CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage(feature);
        CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON feature_usage(timestamp);
      `
    })
    
    if (error) {
      console.error("Error creating feature_usage table:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Error creating feature_usage table:", error)
    return false
  }
}

// Check if user has reached limit for a feature
export async function hasReachedFeatureLimit(
  feature: TrackableFeature
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("Cannot check limit: No authenticated user")
      return true // Fail safe: assume limit reached if no user
    }
    
    // Get user's subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
    
    const plan = subscription?.plan || "free"
    
    // Get the limit based on plan and feature
    let limit: number
    switch (feature) {
      case "mockup_generation":
        limit = planFeatures[plan].mockupsPerMonth
        break
      case "bulk_generation":
        limit = planFeatures[plan].bulkGeneration
        break
      default:
        limit = 0 // Default limit
    }
    
    // If unlimited
    if (limit === Number.POSITIVE_INFINITY) {
      return false
    }
    
    // For monthly limits, check usage this month
    if (feature === "mockup_generation") {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Count usage for this month
      const { count, error } = await supabase
        .from("feature_usage")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .eq("feature", feature)
        .gte("timestamp", firstDayOfMonth.toISOString())
      
      if (error) {
        console.error("Error checking feature usage:", error)
        return false // Fail open to avoid blocking users
      }
      
      return typeof count === "number" && count >= limit
    }
    
    // For bulk generation, just check the limit value
    return false
  } catch (error) {
    console.error("Error checking feature limit:", error)
    return false // Fail open to avoid blocking users
  }
}

// Get usage statistics for a user
export async function getUserUsageStats(): Promise<Record<string, number>> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("Cannot get usage stats: No authenticated user")
      return {} 
    }
    
    // Get current month stats
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Get mockup generation count
    const { count: mockupCount, error: mockupError } = await supabase
      .from("feature_usage")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("feature", "mockup_generation")
      .gte("timestamp", firstDayOfMonth.toISOString())
    
    // Get bulk generation count
    const { count: bulkCount, error: bulkError } = await supabase
      .from("feature_usage")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("feature", "bulk_generation")
      .gte("timestamp", firstDayOfMonth.toISOString())
    
    // Get export count
    const { count: exportCount, error: exportError } = await supabase
      .from("feature_usage")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("feature", "export")
      .gte("timestamp", firstDayOfMonth.toISOString())
    
    return {
      mockup_generation: typeof mockupCount === "number" ? mockupCount : 0,
      bulk_generation: typeof bulkCount === "number" ? bulkCount : 0,
      export: typeof exportCount === "number" ? exportCount : 0
    }
  } catch (error) {
    console.error("Error getting usage stats:", error)
    return {}
  }
}
