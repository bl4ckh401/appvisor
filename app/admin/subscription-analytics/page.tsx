"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Badge } from "@/components/ui/badge"
import { getSubscriptionAnalytics } from "@/lib/subscription"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"

interface AnalyticsData {
  planCounts: Array<{ plan: string; count: number }>
  billingCounts: Array<{ is_annual: boolean; count: number }>
  recentSubscriptions: Array<{
    id: string
    user_id: string
    plan: string
    status: string
    is_annual: boolean
    created_at: string
    current_period_end: string
  }>
}

export default function SubscriptionAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function checkAdminStatus() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = "/auth"
        return
      }

      // Check if user is admin (you would need to implement this logic)
      // For now, we'll just check if they're authenticated
      setIsAdmin(true)

      if (isAdmin) {
        loadAnalytics()
      }
    }

    checkAdminStatus()
  }, [isAdmin])

  async function loadAnalytics() {
    try {
      setLoading(true)
      const data = await getSubscriptionAnalytics()

      if (data) {
        setAnalyticsData(data as AnalyticsData)
      } else {
        throw new Error("Failed to load analytics data")
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load subscription analytics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "bg-lime-500/20 text-lime-500 hover:bg-lime-500/30"
      case "team":
        return "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
      case "canceled":
        return "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
      case "expired":
        return "bg-red-500/20 text-red-500 hover:bg-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  // Calculate total revenue (this is an estimate based on plan prices)
  const calculateRevenue = () => {
    if (!analyticsData) return { monthly: 0, annual: 0, total: 0 }

    let monthlyRevenue = 0
    let annualRevenue = 0

    // Get counts by plan and billing type
    const proMonthlyCount = analyticsData.planCounts.find((p) => p.plan === "pro")?.count || 0
    const teamMonthlyCount = analyticsData.planCounts.find((p) => p.plan === "team")?.count || 0
    const annualCount = analyticsData.billingCounts.find((b) => b.is_annual)?.count || 0
    const monthlyCount = analyticsData.billingCounts.find((b) => !b.is_annual)?.count || 0

    // Calculate revenue based on plan prices
    // Pro: $9.99/month or $108/year
    // Team: $19.99/month or $228/year
    const proAnnualCount = Math.round((proMonthlyCount / (proMonthlyCount + teamMonthlyCount)) * annualCount)
    const teamAnnualCount = annualCount - proAnnualCount

    const proMonthlyRevenue = (proMonthlyCount - proAnnualCount) * 9.99
    const teamMonthlyRevenue = (teamMonthlyCount - teamAnnualCount) * 19.99
    const proAnnualRevenue = proAnnualCount * 108
    const teamAnnualRevenue = teamAnnualCount * 228

    monthlyRevenue = proMonthlyRevenue + teamMonthlyRevenue
    annualRevenue = proAnnualRevenue + teamAnnualRevenue

    return {
      monthly: monthlyRevenue,
      annual: annualRevenue,
      total: monthlyRevenue + annualRevenue,
    }
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <GlassCard className="p-8 text-center">
          <p>You don't have permission to view this page.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscription Analytics</h1>
        <GlassButton onClick={loadAnalytics} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </GlassButton>
      </div>

      {loading ? (
        <GlassCard className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                  <h3 className="text-3xl font-bold">
                    {analyticsData?.planCounts.reduce((sum, item) => sum + item.count, 0) || 0}
                  </h3>
                </div>
                <Users className="h-8 w-8 text-lime-500 opacity-80" />
              </div>
              <div className="text-xs text-muted-foreground">Active subscriptions across all plans</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <h3 className="text-3xl font-bold">${calculateRevenue().monthly.toFixed(2)}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
              </div>
              <div className="text-xs text-muted-foreground">Recurring monthly subscription revenue</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Revenue</p>
                  <h3 className="text-3xl font-bold">${calculateRevenue().annual.toFixed(2)}</h3>
                </div>
                <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
              <div className="text-xs text-muted-foreground">Recurring annual subscription revenue</div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <h3 className="text-3xl font-bold">${calculateRevenue().total.toFixed(2)}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
              <div className="text-xs text-muted-foreground">Combined monthly and annual revenue</div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Subscribers by Plan</h2>
              <div className="space-y-4">
                {analyticsData?.planCounts.map((item) => (
                  <div key={item.plan} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Badge variant="outline" className={getPlanBadgeColor(item.plan)}>
                        {item.plan.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{item.count}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Subscribers by Billing Type</h2>
              <div className="space-y-4">
                {analyticsData?.billingCounts.map((item) => (
                  <div key={item.is_annual ? "annual" : "monthly"} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={
                          item.is_annual
                            ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                            : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        }
                      >
                        {item.is_annual ? "ANNUAL" : "MONTHLY"}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{item.count}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Subscriptions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Plan</th>
                    <th className="text-left py-2 px-4">Billing</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData?.recentSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border/40">
                      <td className="py-2 px-4">{formatDate(sub.created_at)}</td>
                      <td className="py-2 px-4">
                        <Badge variant="outline" className={getPlanBadgeColor(sub.plan)}>
                          {sub.plan.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">{sub.is_annual ? "Annual" : "Monthly"}</td>
                      <td className="py-2 px-4">
                        <Badge variant="outline" className={getStatusBadgeColor(sub.status)}>
                          {sub.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">{formatDate(sub.current_period_end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  )
}
