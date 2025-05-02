"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { planFeatures } from "@/lib/plan-restrictions"

export function useFeatureAccess() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true)

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setSubscription(null)
          return
        }

        // Get active subscription
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error
          console.error("Error fetching subscription:", error)
          setError(error.message)
        } else if (data) {
          setSubscription(data)
        } else {
          // Check for canceled subscription
          const { data: canceledSub } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "canceled")
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (canceledSub) {
            setSubscription(canceledSub)
          } else {
            setSubscription(null)
          }
        }
      } catch (err) {
        console.error("Error in useFeatureAccess:", err)
        setError("Failed to fetch subscription data")
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [supabase])

  // Get current plan based on subscription
  const getCurrentPlan = () => {
    if (!subscription || subscription.status !== "active") {
      return "free"
    }
    return subscription.plan
  }

  // Check if user has access to a specific feature
  const hasAccess = (feature: keyof typeof planFeatures.free) => {
    const currentPlan = getCurrentPlan()
    return planFeatures[currentPlan][feature]
  }

  // Check if user has reached their mockup limit
  const hasReachedMockupLimit = (currentUsage: number) => {
    const currentPlan = getCurrentPlan()
    const limit = planFeatures[currentPlan].mockupsPerMonth

    // If unlimited
    if (limit === Number.POSITIVE_INFINITY) {
      return false
    }

    return currentUsage >= limit
  }

  // Get the limit for a specific feature
  const getFeatureLimit = (feature: keyof typeof planFeatures.free) => {
    const currentPlan = getCurrentPlan()
    return planFeatures[currentPlan][feature]
  }

  return {
    subscription,
    loading,
    error,
    getCurrentPlan,
    hasAccess,
    hasReachedMockupLimit,
    getFeatureLimit,
  }
}
