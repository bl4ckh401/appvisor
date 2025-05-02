import { createClient } from "@/lib/supabase/client"

export type SubscriptionPlan = "free" | "pro" | "team"
export type SubscriptionStatus = "active" | "canceled" | "expired"

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  payment_reference: string | null
  is_annual: boolean
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export async function getUserSubscription(): Promise<Subscription | null> {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get user subscription
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .single()

  if (error || !data) {
    // Return free tier if no subscription found
    return {
      id: "free",
      user_id: session.user.id,
      plan: "free",
      status: "active",
      payment_reference: null,
      is_annual: false,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // Check if subscription has expired
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
    // Update subscription status to expired
    await supabase.from("user_subscriptions").update({ status: "expired" }).eq("id", data.id)

    // Return free tier
    return {
      id: "free",
      user_id: session.user.id,
      plan: "free",
      status: "active",
      payment_reference: null,
      is_annual: false,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return data as Subscription
}

export function isPremiumFeature(feature: string, subscription: Subscription | null): boolean {
  if (!subscription || subscription.plan === "free") {
    return true // Is premium feature (not available)
  }

  // Features available to Pro and Team plans
  const proFeatures = [
    "unlimited_mockups",
    "all_templates",
    "all_export_formats",
    "bulk_generation",
    "custom_branding",
    "priority_support",
  ]

  // Features available only to Team plan
  const teamFeatures = ["team_collaboration", "api_access", "white_labeling", "custom_integrations"]

  if (subscription.plan === "pro") {
    return teamFeatures.includes(feature)
  }

  // Team plan has access to all features
  return false
}

export function getFeatureLimit(feature: string, subscription: Subscription | null): number {
  if (!subscription) {
    return getFreeTierLimit(feature)
  }

  switch (feature) {
    case "mockups_per_month":
      return subscription.plan === "free" ? 5 : Number.POSITIVE_INFINITY
    case "bulk_generation":
      return subscription.plan === "free" ? 3 : subscription.plan === "pro" ? 10 : 50
    case "team_members":
      return subscription.plan === "team" ? 5 : 1
    default:
      return 0
  }
}

function getFreeTierLimit(feature: string): number {
  switch (feature) {
    case "mockups_per_month":
      return 5
    case "bulk_generation":
      return 3
    case "team_members":
      return 1
    default:
      return 0
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("user_subscriptions").update({ status: "canceled" }).eq("id", subscriptionId)

  return !error
}

export async function getSubscriptionAnalytics() {
  const supabase = createClient()

  // Get counts by plan
  const { data: planCounts, error: planError } = await supabase
    .from("user_subscriptions")
    .select("plan, count")
    .eq("status", "active")
    .group("plan")

  // Get counts by billing type (annual vs monthly)
  const { data: billingCounts, error: billingError } = await supabase
    .from("user_subscriptions")
    .select("is_annual, count")
    .eq("status", "active")
    .group("is_annual")

  // Get recent subscriptions
  const { data: recentSubscriptions, error: recentError } = await supabase
    .from("user_subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  if (planError || billingError || recentError) {
    console.error("Error fetching subscription analytics", { planError, billingError, recentError })
    return null
  }

  return {
    planCounts: planCounts || [],
    billingCounts: billingCounts || [],
    recentSubscriptions: recentSubscriptions || [],
  }
}
