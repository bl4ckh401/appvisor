"use client"

import { useState, useEffect } from "react"
import { Card3D } from "@/components/ui/card-3d"
import { GlassButton } from "@/components/ui/glass-button"
import Link from "next/link"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { getUserUsageStats } from "@/lib/usage-tracking"
import { planFeatures } from "@/lib/plan-restrictions"
import { Badge } from "@/components/ui/badge"
import { Loader2, Smartphone, Layers, Users, CreditCard, ChevronRight } from "lucide-react"

function DashboardUsageStats() {
  const { subscription, getCurrentPlan } = useFeatureAccess()
  const [usageStats, setUsageStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Fetch usage statistics
  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        setLoading(true)
        const stats = await getUserUsageStats()
        setUsageStats(stats)
      } catch (error) {
        console.error("Error fetching usage stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsageStats()
  }, [])

  // Get plan-specific details
  const getPlanDetails = () => {
    const plan = getCurrentPlan()
    return {
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      mockupLimit: planFeatures[plan].mockupsPerMonth,
      bulkGenerationLimit: planFeatures[plan].bulkGeneration,
      teamMembers: planFeatures[plan].teamMembers,
      color: plan === "free" ? "gray" : plan === "pro" ? "lime" : "purple",
    }
  }

  const planDetails = getPlanDetails()
  const isFreePlan = getCurrentPlan() === "free"

  // Format subscription expiration date
  const formatExpirationDate = () => {
    if (!subscription || !subscription.current_period_end) return "N/A"

    const date = new Date(subscription.current_period_end)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate days remaining in subscription
  const getDaysRemaining = () => {
    if (!subscription || !subscription.current_period_end) return 0

    const expirationDate = new Date(subscription.current_period_end)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <Card3D className="p-6">
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <p>Loading usage data...</p>
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
            Your Plan
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

        {isFreePlan ? (
          <GlassButton asChild className="mt-4 md:mt-0">
            <Link href="/subscribe?plan=pro">
              Upgrade Plan
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
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
            <div>
              <p className="font-medium">
                Your {subscription.is_annual ? "annual" : "monthly"} subscription{" "}
                {subscription.status === "canceled" ? "ends" : "renews"} on {formatExpirationDate()}
              </p>
              {getDaysRemaining() > 0 && (
                <p className="text-sm text-muted-foreground">
                  {getDaysRemaining()} days remaining in current billing period
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Mockups Created"
          value={usageStats.mockup_generation || 0}
          limit={planDetails.mockupLimit === Number.POSITIVE_INFINITY ? "Unlimited" : planDetails.mockupLimit}
          icon={<Smartphone className="h-5 w-5 text-primary" />}
        />

        <StatCard
          title="Bulk Generation"
          value={usageStats.bulk_generation || 0}
          limit={planDetails.bulkGenerationLimit}
          icon={<Layers className="h-5 w-5 text-primary" />}
        />

        <StatCard
          title="Team Members"
          value={subscription?.team_members || 1}
          limit={planDetails.teamMembers}
          icon={<Users className="h-5 w-5 text-primary" />}
        />
      </div>

      {isFreePlan && (
        <div className="rounded-md bg-background/50 border border-border p-4 mb-6">
          <h4 className="text-lg font-medium mb-2">Upgrade for Unlimited Access</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to a Pro or Team plan to get unlimited mockups, advanced export options, and more features.
          </p>
          <div className="flex gap-3">
            <GlassButton variant="outline" asChild>
              <Link href="/pricing">View Plans</Link>
            </GlassButton>
            <GlassButton asChild>
              <Link href="/subscribe?plan=pro">
                Upgrade to Pro
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </GlassButton>
          </div>
        </div>
      )}
    </Card3D>
  )
}

// Stat card component
function StatCard({ title, value, limit, icon }) {
  // Calculate percentage for numeric limits
  let percentage = 0
  if (typeof limit === "number" && limit > 0) {
    percentage = Math.min(Math.round((value / limit) * 100), 100)
  } else if (limit === "Unlimited") {
    percentage = 0 // No bar for unlimited
  }

  return (
    <div className="bg-background/40 rounded-lg border border-border/40 p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium">{title}</h4>
        {icon}
      </div>

      <div className="flex justify-between items-baseline mb-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">/ {typeof limit === "number" ? limit : limit}</span>
      </div>

      {limit !== "Unlimited" && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-orange-500" : "bg-primary"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function SubscriptionUsagePage() {
  return <DashboardUsageStats />
}
