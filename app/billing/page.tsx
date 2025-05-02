"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getUserSubscription, cancelSubscription, type Subscription } from "@/lib/subscription"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, CheckCircle, AlertCircle, Calendar, Clock } from "lucide-react"

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadSubscription() {
      try {
        setLoading(true)
        const sub = await getUserSubscription()
        setSubscription(sub)
      } catch (error) {
        console.error("Error loading subscription:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [toast])

  const handleCancelSubscription = async () => {
    if (!subscription || subscription.plan === "free") return

    try {
      setCancelLoading(true)
      const success = await cancelSubscription(subscription.id)

      if (success) {
        toast({
          title: "Subscription canceled",
          description: "Your subscription has been canceled. You'll have access until the end of your billing period.",
        })

        // Update local state
        setSubscription({
          ...subscription,
          status: "canceled",
        })

        setCancelDialogOpen(false)
      } else {
        throw new Error("Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancelLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push("/subscribe")
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

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      <Tabs defaultValue="subscription">
        <TabsList className="mb-6">
          <TabsTrigger value="subscription">Current Plan</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          {loading ? (
            <GlassCard className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading subscription details...</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {subscription?.plan === "free"
                      ? "Free Plan"
                      : subscription?.plan === "pro"
                        ? "Pro Plan"
                        : "Team Plan"}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getPlanBadgeColor(subscription?.plan || "free")}>
                      {subscription?.plan?.toUpperCase() || "FREE"}
                    </Badge>
                    <Badge variant="outline" className={getStatusBadgeColor(subscription?.status || "active")}>
                      {subscription?.status?.toUpperCase() || "ACTIVE"}
                    </Badge>
                    {subscription?.is_annual && (
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">
                        ANNUAL
                      </Badge>
                    )}
                  </div>
                </div>

                {subscription?.plan === "free" ? (
                  <GlassButton onClick={handleUpgrade} className="mt-4 md:mt-0">
                    Upgrade Plan
                  </GlassButton>
                ) : subscription?.status === "active" ? (
                  <GlassButton
                    variant="outline"
                    onClick={() => setCancelDialogOpen(true)}
                    className="mt-4 md:mt-0 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    Cancel Subscription
                  </GlassButton>
                ) : (
                  <GlassButton onClick={handleUpgrade} className="mt-4 md:mt-0">
                    Renew Subscription
                  </GlassButton>
                )}
              </div>

              {subscription && subscription.plan !== "free" && (
                <div className="border-t border-border/40 pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Subscription Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Period</p>
                        <p>
                          {formatDate(subscription.current_period_start)} -{" "}
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Billing</p>
                        <p>{subscription.is_annual ? "Annual" : "Monthly"}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Subscription Started</p>
                        <p>{formatDate(subscription.created_at)}</p>
                      </div>
                    </div>

                    {subscription.status === "canceled" && (
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Access Until</p>
                          <p>{formatDate(subscription.current_period_end)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {subscription.status === "canceled" && (
                    <div className="mt-6 p-4 rounded-md bg-orange-500/10 border border-orange-500/20">
                      <p className="text-sm">
                        Your subscription has been canceled but you still have access to premium features until{" "}
                        <strong>{formatDate(subscription.current_period_end)}</strong>. After this date, you'll be
                        downgraded to the Free plan.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {subscription?.plan === "free" && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Available Plans</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-4 border-lime-500/30">
                      <h4 className="text-xl font-bold mb-2">Pro Plan</h4>
                      <Badge variant="outline" className="bg-lime-500/20 text-lime-500 mb-4">
                        RECOMMENDED
                      </Badge>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-lime-500" />
                          <span>Unlimited mockups</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-lime-500" />
                          <span>All premium templates</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-lime-500" />
                          <span>Bulk generation (up to 10)</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-lime-500" />
                          <span>Priority support</span>
                        </li>
                      </ul>
                      <GlassButton onClick={() => router.push("/subscribe?plan=pro")} className="w-full">
                        Upgrade to Pro
                      </GlassButton>
                    </GlassCard>

                    <GlassCard className="p-4 border-purple-500/30">
                      <h4 className="text-xl font-bold mb-2">Team Plan</h4>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-500 mb-4">
                        BEST VALUE
                      </Badge>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                          <span>Everything in Pro</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                          <span>Team collaboration (5 members)</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                          <span>API access</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                          <span>White labeling</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                          <span>Bulk generation (up to 50)</span>
                        </li>
                      </ul>
                      <GlassButton onClick={() => router.push("/subscribe?plan=team")} className="w-full">
                        Upgrade to Team
                      </GlassButton>
                    </GlassCard>
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </TabsContent>

        <TabsContent value="history">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Payment History</h2>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading payment history...</p>
              </div>
            ) : subscription?.plan === "free" ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payment history available for free plan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Description</th>
                      <th className="text-left py-2 px-4">Amount</th>
                      <th className="text-left py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40">
                      <td className="py-2 px-4">{formatDate(subscription?.created_at || "")}</td>
                      <td className="py-2 px-4">
                        {subscription?.plan.toUpperCase()} Plan - {subscription?.is_annual ? "Annual" : "Monthly"}{" "}
                        Subscription
                      </td>
                      <td className="py-2 px-4">
                        $
                        {subscription?.is_annual
                          ? subscription?.plan === "pro"
                            ? "108.00"
                            : "228.00"
                          : subscription?.plan === "pro"
                            ? "9.99"
                            : "19.99"}
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant="outline" className="bg-green-500/20 text-green-500">
                          PAID
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll still have access to premium features until the
              end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLoading}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancelSubscription()
              }}
              disabled={cancelLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
