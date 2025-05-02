"use client"

// lib/plan-restrictions.ts
import { useState, useEffect } from "react"
import type { Subscription } from "@/lib/subscription"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

// Define plan features and limits
export const planFeatures = {
  free: {
    mockupsPerMonth: 2,
    bulkGeneration: 0,
    templates: "basic",
    teamMembers: 1,
    exportFormats: ["png", "jpg"],
    customBranding: false,
    apiAccess: false,
    support: "community",
  },
  pro: {
    mockupsPerMonth: Number.POSITIVE_INFINITY,
    bulkGeneration: 10,
    templates: "all",
    teamMembers: 1,
    exportFormats: ["png", "jpg", "svg", "pdf"],
    customBranding: true,
    apiAccess: false,
    support: "priority",
  },
  team: {
    mockupsPerMonth: Number.POSITIVE_INFINITY,
    bulkGeneration: 50,
    templates: "all",
    teamMembers: 5,
    exportFormats: ["png", "jpg", "svg", "pdf", "html"],
    customBranding: true,
    apiAccess: true,
    support: "dedicated",
  },
}

type PlanType = "free" | "pro" | "team"
type FeatureKey = keyof typeof planFeatures.free

// Check if a feature is available for a plan
export function hasFeatureAccess(feature: FeatureKey, plan: PlanType = "free"): boolean {
  if (!planFeatures[plan]) return false

  const freePlan = planFeatures.free
  const targetPlan = planFeatures[plan]

  // For numeric limits
  if (typeof targetPlan[feature] === "number") {
    return targetPlan[feature] > freePlan[feature]
  }

  // For boolean features
  if (typeof targetPlan[feature] === "boolean") {
    return targetPlan[feature] === true
  }

  // For array features (check if length is greater)
  if (Array.isArray(targetPlan[feature])) {
    return targetPlan[feature].length > freePlan[feature].length
  }

  // For string features like "all" vs "basic"
  return targetPlan[feature] !== freePlan[feature]
}

// Check if the user has reached their monthly mockup limit
export async function hasReachedMockupLimit(userId: string): Promise<boolean> {
  const supabase = createClient()
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get user's subscription
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  // Get count of mockups created this month
  const { count, error } = await supabase
    .from("mockups")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .gte("created_at", firstDayOfMonth.toISOString())

  if (error) {
    console.error("Error checking mockup limit:", error)
    return false
  }

  // Get limit based on plan
  const plan = subscription?.plan || "free"
  const limit = planFeatures[plan as PlanType].mockupsPerMonth

  return typeof count === "number" && count >= limit
}

// React hook for feature access
export function useFeatureAccess() {
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user's subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setSubscription(null)
          return
        }

        const { data } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        setSubscription(data as Subscription)
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  // Check if user can access a feature
  const canAccess = (feature: FeatureKey): boolean => {
    if (loading) return false
    const plan = (subscription?.plan as PlanType) || "free"
    return hasFeatureAccess(feature, plan)
  }

  // Handle premium feature access
  const handlePremiumFeature = (feature: FeatureKey, onUpgrade?: () => void): boolean => {
    const hasAccess = canAccess(feature)

    if (!hasAccess) {
      toast({
        title: "Premium Feature",
        description: `This feature is only available on paid plans.`,
        variant: "destructive",
      })

      if (onUpgrade) {
        onUpgrade()
      }
    }

    return hasAccess
  }

  return {
    subscription,
    loading,
    canAccess,
    handlePremiumFeature,
    getPlan: () => (subscription?.plan as PlanType) || "free",
  }
}

// Function to get the limit for a specific feature based on plan
export function getFeatureLimit(feature: FeatureKey, plan: PlanType = "free"): any {
  if (!planFeatures[plan]) return planFeatures.free[feature]
  return planFeatures[plan][feature]
}

// Get remaining usage for a feature
export async function getRemainingUsage(feature: FeatureKey, userId: string): Promise<number> {
  if (feature !== "mockupsPerMonth" && feature !== "bulkGeneration") return 0

  const supabase = createClient()

  // Get user's subscription
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  const plan = (subscription?.plan as PlanType) || "free"
  const limit = planFeatures[plan][feature]

  // If unlimited, return infinity
  if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY

  if (feature === "mockupsPerMonth") {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get count of mockups created this month
    const { count, error } = await supabase
      .from("mockups")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", firstDayOfMonth.toISOString())

    if (error || typeof count !== "number") return limit

    return Math.max(0, limit - count)
  }

  return limit
}
