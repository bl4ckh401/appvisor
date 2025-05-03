"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { PremiumFeaturesModal } from "@/components/premium-features-modal"
import { planFeatures } from "@/lib/plan-restrictions"

// Feature keys type from planFeatures
type FeatureKey = keyof typeof planFeatures.free
type PlanType = "free" | "pro" | "team"

export function useFeatureAccess() {
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [currentFeature, setCurrentFeature] = useState<FeatureKey | null>(null)

  // Fetch user's subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
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
          
        setSubscription(data)
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubscription()
  }, [])
  
  // Get current user plan
  const getCurrentPlan = (): PlanType => {
    if (!subscription) return "free"
    return (subscription.plan as PlanType) || "free"
  }
  
  // Check if user can access a feature
  const canAccess = (feature: FeatureKey): boolean => {
    if (loading) return false
    const plan = getCurrentPlan()
    
    // For numeric limits, check if the plan value is higher than free
    if (typeof planFeatures[plan][feature] === "number") {
      return planFeatures[plan][feature] > planFeatures.free[feature]
    }
    
    // For boolean features
    if (typeof planFeatures[plan][feature] === "boolean") {
      return planFeatures[plan][feature] === true
    }
    
    // For array features (check if they have more options)
    if (Array.isArray(planFeatures[plan][feature])) {
      return (planFeatures[plan][feature] as any[]).length > 
             (planFeatures.free[feature] as any[]).length
    }
    
    // For string values like "all" vs "basic"
    return planFeatures[plan][feature] !== planFeatures.free[feature]
  }
  
  // Open premium modal for a specific feature
  const showPremiumFeature = (feature: FeatureKey) => {
    setCurrentFeature(feature)
    setIsPremiumModalOpen(true)
  }
  
  // Check if user can use a premium feature, show modal if not
  const checkFeatureAccess = (feature: FeatureKey): boolean => {
    const hasAccess = canAccess(feature)
    
    if (!hasAccess) {
      showPremiumFeature(feature)
    }
    
    return hasAccess
  }
  
  // Get the limit for a specific feature
  const getFeatureLimit = (feature: FeatureKey): any => {
    const plan = getCurrentPlan()
    return planFeatures[plan][feature]
  }
  
  // Get remaining usage for a limited feature
  const getRemaining = async (feature: FeatureKey): Promise<number> => {
    if (feature !== "mockupsPerMonth" && feature !== "bulkGeneration") {
      return 0
    }
    
    const limit = getFeatureLimit(feature)
    if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY
    
    // For mockups per month, calculate remaining
    if (feature === "mockupsPerMonth") {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return 0
        
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const { count, error } = await supabase
          .from("mockups")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .gte("created_at", firstDayOfMonth.toISOString())
          
        if (error || typeof count !== "number") return limit
        
        return Math.max(0, limit - count)
      } catch (error) {
        console.error("Error getting remaining usage:", error)
        return 0
      }
    }
    
    return limit
  }
  
  // React component to render the PremiumFeaturesModal
  const PremiumModal = () => {
    if (!currentFeature) return null
    
    return (
      <PremiumFeaturesModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        feature={currentFeature}
        plan={subscription?.plan === "pro" ? "team" : "pro"}
      />
    )
  }
  
  return {
    subscription,
    loading,
    canAccess,
    checkFeatureAccess,
    showPremiumFeature,
    getFeatureLimit,
    getRemaining,
    getCurrentPlan,
    PremiumModal,
  }
}
