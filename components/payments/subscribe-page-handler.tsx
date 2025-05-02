// components/payments/subscribe-page-handler.tsx

"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card3D } from "@/components/ui/card-3d"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { initializePaystack, verifyPayment } from "@/lib/paystack"
import { useToast } from "@/hooks/use-toast"
import { planFeatures } from "@/lib/plan-restrictions"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Loader2, Sparkles, ChevronRight } from 'lucide-react'

export function SubscribePageHandler() {
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [annual, setAnnual] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Get plan from URL parameters
  const planParam = searchParams.get("plan") || "pro"
  const plan = planParam === "team" ? "team" : "pro"

  // Check annual billing option from URL
  useEffect(() => {
    const billingParam = searchParams.get("billing")
    if (billingParam === "annual") {
      setAnnual(true)
    }
  }, [searchParams])

  // Check authentication and current subscription
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Redirect to auth page if not logged in
          router.push(`/auth?redirect=/subscribe?plan=${plan}${annual ? "&billing=annual" : ""}`)
          return
        }

        setUser(user)

        // Get current subscription
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (sub) {
          setCurrentPlan(sub.plan)

          // If already subscribed to this plan, redirect to dashboard
          if (sub.plan === plan) {
            toast({
              title: "Already Subscribed",
              description: `You're already subscribed to the ${plan.toUpperCase()} plan.`,
            })
            router.push("/dashboard")
          }
        } else {
          setCurrentPlan("free")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [plan, annual, router, supabase, toast])

  // Check for payment success from redirect
  useEffect(() => {
    const reference = searchParams.get("reference")
    if (reference) {
      handlePaymentVerification(reference)
    }
  }, [searchParams])

  // Calculate amount based on plan and billing cycle
  const getAmount = () => {
    if (plan === "pro") {
      return annual ? 180 * 100 : 19 * 100 // Convert to cents
    } else if (plan === "team") {
      return annual ? 468 * 100 : 49 * 100 // Convert to cents
    }
    return 0
  }

  // Get display price for plan
  const getDisplayPrice = () => {
    if (plan === "pro") {
      return annual ? "$180" : "$19"
    } else {
      return annual ? "$468" : "$49"
    }
  }

  // Get display period for plan
  const getDisplayPeriod = () => {
    return annual ? "/year" : "/month"
  }

  // Format savings amount
  const getSavingsAmount = () => {
    if (plan === "pro") {
      // $19/month x 12 = $228, annual is $180, saving $48
      return "$48"
    } else {
      // $49/month x 12 = $588, annual is $468, saving $120
      return "$120"
    }
  }

  // Handle payment initialization
  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      })
      return
    }

    if (currentPlan === plan) {
      toast({
        title: "Already Subscribed",
        description: `You're already subscribed to the ${plan.toUpperCase()} plan.`,
      })
      return
    }

    try {
      setSubscribing(true)
      setError(null)

      // Try to track subscription attempt, but don't block if it fails
      // Use a fire-and-forget approach
      trackFeatureUsage("subscription_attempt", {
        plan,
        is_annual: annual,
      }).catch((err) => {
        // Just log the error, don't block the subscription process
        console.log("Non-critical: Failed to track subscription attempt", err)
      })

      // Initialize Paystack payment
      const paystackConfig = {
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: user.email,
        amount: getAmount(),
        currency: "USD",
        metadata: {
          plan_type: plan,
          is_annual: annual,
          user_id: user.id,
        },
        callback_url: `${window.location.origin}/subscribe/success?plan=${plan}&annual=${annual ? "true" : "false"}`,
      }

      // Call Paystack
      const reference = await initializePaystack(paystackConfig)

      setProcessingPayment(true)

      // Normally, the Paystack popup would handle the redirect,
      // but we'll implement the verification here for completeness
      await handlePaymentVerification(reference)
    } catch (error) {
      console.error("Payment error:", error)
      setError(error.message || "An error occurred during payment processing.")

      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
      setProcessingPayment(false)
    }
  }

  // Handle payment verification after Paystack redirect
  const handlePaymentVerification = async (reference: string) => {
    try {
      setProcessingPayment(true)

      // Verify payment on the server
      const verification = await verifyPayment(reference)

      if (verification.success) {
        setPaymentSuccess(true)

        // Try to track successful subscription, but don't block if it fails
        // Use a fire-and-forget approach
        trackFeatureUsage("subscription_success", {
          plan,
          is_annual: annual,
          reference,
        }).catch((err) => {
          // Just log the error, don't block the subscription process
          console.log("Non-critical: Failed to track subscription success", err)
        })

        toast({
          title: "Payment Successful!",
          description: `You are now subscribed to the ${plan.toUpperCase()} plan.`,
        })

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } else {
        throw new Error("Payment verification failed")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setError(error.message || "Failed to verify payment.")

      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify your payment. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <Card3D className="p-8 text-center" intensity="medium">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p>Loading subscription details...</p>
      </Card3D>
    )
  }

  if (paymentSuccess) {
    return (
      <Card3D className="p-8 text-center" intensity="medium">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-center text-muted-foreground mb-6">
          Your subscription has been activated. Thank you for subscribing!
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md font-medium inline-flex items-center hover:opacity-90 transition-all"
        >
          Go to Dashboard
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Card3D>
    )
  }

  return (
    <Card3D className="p-6" intensity="medium">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/pricing"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pricing
        </Link>

        {plan === "pro" ? (
          <Badge className="bg-green-500/20 text-green-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        ) : (
          <Badge className="bg-purple-500/20 text-purple-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Best Value
          </Badge>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Subscribe to {plan === "pro" ? "Pro" : "Team"} Plan</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="billing-toggle">Billing Cycle</Label>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${!annual ? "text-primary" : "text-muted-foreground"}`}>Monthly</span>
            <Switch
              id="billing-toggle"
              checked={annual}
              onCheckedChange={(checked) => {
                setAnnual(checked)
                // Update URL params
                const params = new URLSearchParams(searchParams.toString())
                if (checked) {
                  params.set("billing", "annual")
                } else {
                  params.delete("billing")
                }
                router.replace(`/subscribe?${params.toString()}`)
              }}
            />
            <span className={`text-sm ${annual ? "text-primary" : "text-muted-foreground"}`}>
              Annual <span className="text-xs text-emerald-500 font-semibold">Save {getSavingsAmount()}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Subscription Summary</h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span className="font-medium">{plan === "pro" ? "Pro" : "Team"}</span>
          </div>

          <div className="flex justify-between">
            <span>Billing:</span>
            <span className="font-medium">{annual ? "Annual" : "Monthly"}</span>
          </div>

          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-medium">
              {getDisplayPrice()}
              {getDisplayPeriod()}
            </span>
          </div>

          {annual && (
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-emerald-500">
                <span>Annual Savings:</span>
                <span className="font-medium">{getSavingsAmount()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">What's Included</h3>

        <div className="space-y-2">
          {plan === "pro" ? (
            <>
              <FeatureItem>Unlimited mockups</FeatureItem>
              <FeatureItem>All templates ({planFeatures.pro.templates})</FeatureItem>
              <FeatureItem>All export formats ({planFeatures.pro.exportFormats.join(", ")})</FeatureItem>
              <FeatureItem>Bulk generation (up to {planFeatures.pro.bulkGeneration})</FeatureItem>
              <FeatureItem>Custom branding</FeatureItem>
              <FeatureItem>Priority support</FeatureItem>
            </>
          ) : (
            <>
              <FeatureItem>Everything in Pro plan</FeatureItem>
              <FeatureItem>Team collaboration (up to {planFeatures.team.teamMembers} members)</FeatureItem>
              <FeatureItem>Bulk generation (up to {planFeatures.team.bulkGeneration})</FeatureItem>
              <FeatureItem>API access</FeatureItem>
              <FeatureItem>Dedicated support</FeatureItem>
              <FeatureItem>White labeling</FeatureItem>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-md bg-destructive/10 text-destructive flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <button
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md font-medium flex items-center justify-center hover:opacity-90 transition-all"
        onClick={handleSubscribe}
        disabled={subscribing || processingPayment}
      >
        {subscribing || processingPayment ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {processingPayment ? "Processing Payment..." : "Initializing Payment..."}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Subscribe Now
          </>
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground mt-4">
        By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription at any
        time.
      </p>
    </Card3D>
  )
}

// Feature item component
function FeatureItem({ children }) {
  return (
    <div className="flex items-center">
      <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
      <span>{children}</span>
    </div>
  )
}
