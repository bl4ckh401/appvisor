"use client"

import { useState, useEffect } from "react"
import { Card3D } from "@/components/ui/card-3d"
import { GlassButton } from "@/components/ui/glass-button"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { getUserUsageStats } from "@/lib/usage-tracking"
import { planFeatures } from "@/lib/plan-restrictions"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Loader2, Smartphone, Layers, Clock, CreditCard, CheckCircle, AlertCircle } from "lucide-react"

export function SubscriptionUsageDashboard() {
  const { subscription, loading, getCurrentPlan } = useFeatureAccess()
  const [usageStats, setUsageStats] = useState<Record<string, number>>({})
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch usage statistics
  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        setLoadingStats(true)
        const stats = await getUserUsageStats()
        setUsageStats(stats)
      } catch (error) {
        console.error("Error fetching usage stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (!loading) {
      fetchUsageStats()
    }
  }, [loading])

  // Format subscription expiration date
  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate days remaining in subscription
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return 0

    const expirationDate = new Date(dateString)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Get plan-specific details
  const getPlanDetails = () => {
    const plan = getCurrentPlan()
    return {
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      mockupLimit: planFeatures[plan].mockupsPerMonth,
      bulkGenerationLimit: planFeatures[plan].bulkGeneration,
      color: plan === "free" ? "gray" : plan === "pro" ? "lime" : "purple",
    }
  }

  const planDetails = getPlanDetails()
  const daysRemaining = subscription ? getDaysRemaining(subscription.current_period_end) : 0

  if (loading || loadingStats) {
    return (
      <Card3D className="p-6">
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <p>Loading subscription information...</p>
        </div>
      </Card3D>
    )
  }

  return (
    <Card3D className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <CreditCard className="h-5 w-5 text-primary mr-2" />
            Subscription Status
          </h3>
          <div className="flex items-center mt-1">
            <Badge
              variant="outline"
              className={`bg-${planDetails.color}-500/20 text-${planDetails.color}-500 hover:bg-${planDetails.color}-500/30`}
            >
              {planDetails.name} PLAN
            </Badge>

            {subscription && subscription.status === "active" && (
              <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/30">
                ACTIVE
              </Badge>
            )}

            {subscription && subscription.status === "canceled" && (
              <Badge variant="outline" className="ml-2 bg-orange-500/20 text-orange-500 hover:bg-orange-500/30">
                CANCELED
              </Badge>
            )}
          </div>
        </div>

        {getCurrentPlan() === "free" ? (
          <GlassButton asChild className="mt-4 md:mt-0">
            <Link href="/subscribe">Upgrade Plan</Link>
          </GlassButton>
        ) : (
          <Link href="/billing" className="text-sm text-primary hover:underline mt-4 md:mt-0">
            Manage Subscription
          </Link>
        )}
      </div>

      {subscription && subscription.status === "active" && getCurrentPlan() !== "free" && (
        <div className="mb-6 p-4 rounded-lg border border-border/40 bg-background/30">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium">
                Your {subscription.is_annual ? "annual" : "monthly"} subscription{" "}
                {subscription.status === "canceled" ? "ends" : "renews"} on{" "}
                {formatExpirationDate(subscription.current_period_end)}
              </p>
              {daysRemaining > 0 && (
                <p className="text-sm text-muted-foreground">
                  {daysRemaining} days remaining in current billing period
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {subscription && subscription.status === "canceled" && (
        <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-orange-500">Your subscription has been canceled</p>
              <p className="text-sm">
                You'll still have access to premium features until{" "}
                {formatExpirationDate(subscription.current_period_end)}. After that, you'll be downgraded to the Free
                plan.
              </p>
              <GlassButton className="mt-2" size="sm" asChild>
                <Link href="/subscribe">Renew Subscription</Link>
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      <h4 className="text-lg font-medium mb-4">Monthly Usage</h4>

      <div className="space-y-4">
        <UsageBar
          label="Mockups Created"
          icon={<Smartphone className="h-4 w-4 text-primary" />}
          current={usageStats.mockup_generation || 0}
          limit={planDetails.mockupLimit === Number.POSITIVE_INFINITY ? "Unlimited" : planDetails.mockupLimit}
        />

        <UsageBar
          label="Bulk Generation"
          icon={<Layers className="h-4 w-4 text-primary" />}
          current={usageStats.bulk_generation || 0}
          limit={planDetails.bulkGenerationLimit}
        />
      </div>

      <div className="mt-6 border-t border-border/40 pt-4">
        <h4 className="text-lg font-medium mb-2">Plan Features</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <PlanFeature
            feature="Mockups"
            value={
              planDetails.mockupLimit === Number.POSITIVE_INFINITY
                ? "Unlimited"
                : `${planDetails.mockupLimit} per month`
            }
            available={true}
          />

          <PlanFeature
            feature="Templates"
            value={planFeatures[getCurrentPlan()].templates === "all" ? "All Templates" : "Basic Templates"}
            available={planFeatures[getCurrentPlan()].templates === "all"}
          />

          <PlanFeature
            feature="Bulk Generation"
            value={`Up to ${planDetails.bulkGenerationLimit} at once`}
            available={planFeatures[getCurrentPlan()].bulkGeneration > planFeatures.free.bulkGeneration}
          />

          <PlanFeature
            feature="Team Members"
            value={`${planFeatures[getCurrentPlan()].teamMembers}`}
            available={planFeatures[getCurrentPlan()].teamMembers > 1}
          />

          <PlanFeature
            feature="Custom Branding"
            value={planFeatures[getCurrentPlan()].customBranding ? "Available" : "Not Available"}
            available={planFeatures[getCurrentPlan()].customBranding}
          />

          <PlanFeature
            feature="API Access"
            value={planFeatures[getCurrentPlan()].apiAccess ? "Available" : "Not Available"}
            available={planFeatures[getCurrentPlan()].apiAccess}
          />
        </div>
      </div>
    </Card3D>
  )
}

// Usage progress bar component
function UsageBar({ label, icon, current, limit }) {
  // Calculate percentage for numeric limits
  let percentage = 0
  if (typeof limit === "number" && limit > 0) {
    percentage = Math.min(Math.round((current / limit) * 100), 100)
  } else if (limit === "Unlimited") {
    percentage = 0 // No bar for unlimited
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm">
          {current} / {typeof limit === "number" ? limit : limit}
        </span>
      </div>

      {limit !== "Unlimited" && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-orange-500" : "bg-primary"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Plan feature display component
function PlanFeature({ feature, value, available }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{feature}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">{value}</span>
        {available ? (
          <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
        ) : (
          <AlertCircle className="h-4 w-4 text-muted-foreground ml-1" />
        )}
      </div>
    </div>
  )
}
