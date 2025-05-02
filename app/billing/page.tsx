"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card3D } from "@/components/ui/card-3d"
import { GlassButton } from "@/components/ui/glass-button"
import { Badge } from "@/components/ui/badge"
import { SubscriptionUsageDashboard } from "@/components/subscription-usage-dashboard"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true)

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Redirect to auth page if not logged in
          router.push("/auth?redirect=/billing")
          return
        }

        // Get active subscription
        const { data: activeSub } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (activeSub) {
          setSubscription(activeSub)
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
          }
        }

        // Get payment history
        const { data: payments } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (payments) {
          setPaymentHistory(payments)
        }
      } catch (err) {
        console.error("Error fetching subscription data:", err)
        setError("Failed to load subscription data")
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [supabase, router])

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      setCancelling(true)

      // Call API to cancel subscription
      const response = await fetch("/api/payments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: subscription.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to cancel subscription")
      }

      // Update subscription status locally
      setSubscription({
        ...subscription,
        status: "canceled",
      })

      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll have access until the end of your billing period.",
      })
    } catch (err) {
      console.error("Error canceling subscription:", err)
      setError(err.message || "Failed to cancel subscription")

      toast({
        title: "Error",
        description: err.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card3D className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading subscription details...</p>
        </Card3D>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      {error && (
        <div className="p-4 mb-6 rounded-md bg-destructive/10 text-destructive flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Subscription Usage Dashboard */}
        <SubscriptionUsageDashboard />

        {/* Subscription Management */}
        {subscription && (
          <Card3D className="p-6">
            <h3 className="text-xl font-bold flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-primary mr-2" />
              Subscription Management
            </h3>

            <div className="space-y-4">
              {subscription.status === "active" && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 rounded-lg border border-border/40 bg-background/30">
                  <div>
                    <p className="font-medium">Cancel Subscription</p>
                    <p className="text-sm text-muted-foreground">
                      You'll still have access until {formatDate(subscription.current_period_end)}
                    </p>
                  </div>

                  <GlassButton variant="destructive" onClick={handleCancelSubscription} disabled={cancelling}>
                    {cancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </GlassButton>
                </div>
              )}

              {subscription.status === "canceled" && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 rounded-lg border border-border/40 bg-background/30">
                  <div>
                    <p className="font-medium">Renew Subscription</p>
                    <p className="text-sm text-muted-foreground">
                      Your subscription ends on {formatDate(subscription.current_period_end)}
                    </p>
                  </div>

                  <GlassButton asChild>
                    <Link href={`/subscribe?plan=${subscription.plan}`}>Renew Subscription</Link>
                  </GlassButton>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 rounded-lg border border-border/40 bg-background/30">
                <div>
                  <p className="font-medium">Change Plan</p>
                  <p className="text-sm text-muted-foreground">Upgrade or downgrade your subscription</p>
                </div>

                <GlassButton asChild variant="outline">
                  <Link href="/pricing">View Plans</Link>
                </GlassButton>
              </div>
            </div>
          </Card3D>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card3D className="p-6">
            <h3 className="text-xl font-bold mb-4">Payment History</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 px-4 font-medium">Date</th>
                    <th className="text-left py-2 px-4 font-medium">Plan</th>
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                    <th className="text-left py-2 px-4 font-medium">Period</th>
                    <th className="text-left py-2 px-4 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b border-border/20">
                      <td className="py-2 px-4">{formatDate(payment.created_at)}</td>
                      <td className="py-2 px-4">
                        <Badge variant="outline" className="capitalize">
                          {payment.plan}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        {payment.status === "active" ? (
                          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : payment.status === "canceled" ? (
                          <Badge className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30">Canceled</Badge>
                        ) : (
                          <Badge variant="outline">{payment.status}</Badge>
                        )}
                      </td>
                      <td className="py-2 px-4">{payment.is_annual ? "Annual" : "Monthly"}</td>
                      <td className="py-2 px-4">
                        <span className="text-xs font-mono">
                          {payment.payment_reference ? payment.payment_reference.substring(0, 10) + "..." : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card3D>
        )}

        {/* No Subscription */}
        {!subscription && (
          <Card3D className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">No Active Subscription</h3>
            <p className="text-muted-foreground mb-6">
              You don't have an active subscription. Upgrade to a paid plan to access premium features.
            </p>
            <GlassButton asChild>
              <Link href="/pricing">View Plans</Link>
            </GlassButton>
          </Card3D>
        )}
      </div>
    </div>
  )
}
