// lib/usage-tracking.ts
import { createClient } from "@/lib/supabase/client"
import { planFeatures } from "@/lib/plan-restrictions"

// Feature types that can be tracked
export type TrackableFeature =
  | "mockup_generation"
  | "bulk_generation"
  | "export"
  | "api_call"
  | "subscription_attempt"
  | "subscription_success"
  | "gpt_image_generation"
  | "gpt_image_editing"

// Interface for tracking usage
export interface UsageTracking {
  user_id: string
  feature: TrackableFeature
  count: number
  timestamp: string
  metadata?: Record<string, any>
}

// Track feature usage
export async function trackFeatureUsage(
  feature: TrackableFeature,
  metadata: Record<string, any> = {},
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("Cannot track usage: No authenticated user")
      return false
    }
    
    // Always log to localStorage first as a backup
    logUsageToLocalStorage(user.id, feature, metadata)
    
    // Now try to log to the database via API
    try {
      const response = await fetch("/api/feature-usage/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feature,
          metadata,
        }),
      })
      
      if (!response.ok) {
        console.error("Error tracking feature usage via API:", await response.text())
        return false
      }
      
      return true
    } catch (apiError) {
      console.error("Error calling feature usage API:", apiError)
      return false
    }
  } catch (error) {
    console.error("Error in trackFeatureUsage:", error)
    return false
  }
}

// Fallback: Log usage to localStorage when database is unavailable
function logUsageToLocalStorage(userId: string, feature: TrackableFeature, metadata: Record<string, any> = {}) {
  try {
    if (typeof window === "undefined") return

    const key = `feature_usage_${userId}`
    const existingData = localStorage.getItem(key)
    const usageData = existingData ? JSON.parse(existingData) : []

    usageData.push({
      feature,
      timestamp: new Date().toISOString(),
      metadata,
    })

    // Keep only last 100 entries to prevent localStorage from growing too large
    if (usageData.length > 100) {
      usageData.splice(0, usageData.length - 100)
    }

    localStorage.setItem(key, JSON.stringify(usageData))
  } catch (e) {
    // Silent fail for localStorage
  }
}

// Check if user has reached limit for a feature
export async function hasReachedFeatureLimit(feature: TrackableFeature): Promise<boolean> {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      case "gpt_image_generation":
        limit = planFeatures[plan].gptImageGenerationsPerMonth || 5
        break
      case "gpt_image_editing":
        // Use the same limit as generation for editing
        limit = planFeatures[plan].gptImageGenerationsPerMonth || 5
        break
      case "bulk_generation":
        limit = planFeatures[plan].bulkGeneration
        break
      default:
        limit = 0
    }

    // If unlimited
    if (limit === Number.POSITIVE_INFINITY) {
      return false
    }

    // For monthly limits, check usage this month
    if (feature === "mockup_generation" || feature === "gpt_image_generation" || feature === "gpt_image_editing") {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Try to get usage count via API
      try {
        const response = await fetch(`/api/feature-usage/count?feature=${feature}&since=${firstDayOfMonth.toISOString()}`)
        
        if (!response.ok) {
          console.error("Error fetching usage count:", await response.text())
          return false // Fail open to avoid blocking users
        }
        
        const data = await response.json()
        const currentUsage = data.count || 0
        
        console.log(`Feature ${feature} usage: ${currentUsage}/${limit}`)
        
        return currentUsage >= limit
      } catch (error) {
        console.error("Error checking feature limit:", error)
        
        // Fallback to checking localStorage
        const localUsage = getLocalStorageUsageCount(user.id, feature, firstDayOfMonth)
        return localUsage >= limit
      }
    }

    // For bulk generation, just check the limit value
    return false
  } catch (error) {
    console.error("Error checking feature limit:", error)
    return false // Fail open to avoid blocking users
  }
}

// Get usage count from localStorage (fallback)
function getLocalStorageUsageCount(userId: string, feature: TrackableFeature, since: Date): number {
  try {
    if (typeof window === "undefined") return 0

    const key = `feature_usage_${userId}`
    const existingData = localStorage.getItem(key)
    
    if (!existingData) return 0
    
    const usageData = JSON.parse(existingData)
    
    // Count usage since the specified date
    const count = usageData.filter((entry: any) => {
      return entry.feature === feature && new Date(entry.timestamp) >= since
    }).length
    
    return count
  } catch (e) {
    return 0
  }
}

// Get usage statistics for a user
export async function getUserUsageStats(): Promise<Record<string, number>> {
  try {
    // Try to get usage stats via API
    const response = await fetch("/api/feature-usage/stats")
    
    if (!response.ok) {
      console.error("Error fetching usage stats:", await response.text())
      return {
        mockup_generation: 0,
        bulk_generation: 0,
        export: 0,
        gpt_image_generation: 0,
        gpt_image_editing: 0,
      }
    }
    
    const data = await response.json()
    return data.stats
  } catch (error) {
    console.error("Error getting usage stats:", error)
    return {
      mockup_generation: 0,
      bulk_generation: 0,
      export: 0,
      gpt_image_generation: 0,
      gpt_image_editing: 0,
    }
  }
}

// Get remaining usage for a specific feature
export async function getRemainingUsage(feature: TrackableFeature): Promise<number> {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return 0
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
      case "gpt_image_generation":
      case "gpt_image_editing":
        limit = planFeatures[plan].gptImageGenerationsPerMonth || 5
        break
      case "bulk_generation":
        limit = planFeatures[plan].bulkGeneration
        break
      default:
        return 0
    }

    // If unlimited
    if (limit === Number.POSITIVE_INFINITY) {
      return Number.POSITIVE_INFINITY
    }

    // Get current usage
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    try {
      const response = await fetch(`/api/feature-usage/count?feature=${feature}&since=${firstDayOfMonth.toISOString()}`)
      
      if (!response.ok) {
        return limit // Return full limit if we can't get usage
      }
      
      const data = await response.json()
      const currentUsage = data.count || 0
      
      return Math.max(0, limit - currentUsage)
    } catch (error) {
      console.error("Error getting remaining usage:", error)
      return limit // Return full limit if we can't get usage
    }
  } catch (error) {
    console.error("Error in getRemainingUsage:", error)
    return 0
  }
}
