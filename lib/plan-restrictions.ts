"use client"

// lib/plan-restrictions.ts
import { useState, useEffect } from "react"
import type { Subscription } from "@/lib/subscription"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

// Define plan features and limits
export const planFeatures = {
  free: {
    mockupsPerMonth: 5,
    templates: "basic", // basic or all
    exportFormats: ["png", "jpg"],
    bulkGeneration: 3,
    teamMembers: 1,
    customBranding: false,
    apiAccess: false,
    gptImageGeneration: true, // Changed to true to allow free usage
    gptImageEditing: false,
    gptImageGenerationsPerMonth: 5, // Added this new limit
  },
  pro: {
    mockupsPerMonth: Number.POSITIVE_INFINITY, // Unlimited
    templates: "all",
    exportFormats: ["png", "jpg", "svg", "pdf"],
    bulkGeneration: 10,
    teamMembers: 1,
    customBranding: true,
    apiAccess: false,
    gptImageGeneration: true,
    gptImageEditing: false,
    gptImageGenerationsPerMonth: 50, // Added higher limit for pro
  },
  team: {
    mockupsPerMonth: Number.POSITIVE_INFINITY, // Unlimited
    templates: "all",
    exportFormats: ["png", "jpg", "svg", "pdf", "figma"],
    bulkGeneration: 50,
    teamMembers: 5,
    customBranding: true,
    apiAccess: true,
    gptImageGeneration: true,
    gptImageEditing: true,
    gptImageGenerationsPerMonth: Number.POSITIVE_INFINITY, // Unlimited for team
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
export function getFeatureLimit(plan: string, feature: string): any {
  const planType = plan as keyof typeof planFeatures
  if (!planFeatures[planType]) {
    return planFeatures.free[feature as keyof typeof planFeatures.free]
  }
  return planFeatures[planType][feature as keyof (typeof planFeatures)[typeof planType]]
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
