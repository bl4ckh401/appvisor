"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card3D } from "@/components/ui/card-3d"
import { GlassButton } from "@/components/ui/glass-button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { initializePaystack, verifyPayment } from "@/lib/paystack"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SubscribePage() {
  const [loading, setLoading] = useState(true)
  const [initializingPayment, setInitializingPayment] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [annual, setAnnual] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const planParam = searchParams.get("plan") || "pro"
  const plan = planParam === "team" ? "team" : "pro"
  const reference = searchParams.get("reference") // For payment verification

  // Handle successful Paystack payments
  useEffect(() => {
    const verifyPaystackPayment = async () => {
      if (!reference) return
      
      try {
        setVerifyingPayment(true)
        
        // Call your verify payment API
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Payment verification failed")
        }
        
        const result = await response.json()
        
        // Show success message
        setPaymentSuccess(true)
        toast({
          title: "Payment successful!",
          description: `You are now subscribed to the ${plan.toUpperCase()} plan.`,
        })
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (error) {
        console.error("Payment verification error:", error)
        toast({
          title: "Payment verification failed",
          description: error.message || "An error occurred during payment verification.",
          variant: "destructive",
        })
      } finally {
        setVerifyingPayment(false)
      }
    }
    
    if (reference) {
      verifyPaystackPayment()
    }
  }, [reference, plan, toast, router])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Redirect to auth page if not logged in
          router.push(`/auth?redirect=/subscribe?plan=${plan}`)
          return
        }

        setUser(user)
      } catch (error) {
        console.error("Auth error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router, plan])

  // Calculate amount based on plan and billing cycle
  const getAmount = () => {
    if (plan === "pro") {
      return annual ? 15 * 12 * 100 : 19 * 100 // Convert to cents
    } else if (plan === "team") {
      return annual ? 39 * 12 * 100 : 49 * 100 // Convert to cents
    }
    return 0
  }

  // Calculate discount amount for annual billing
  const getDiscountAmount = () => {
    if (plan === "pro") {
      return annual ? (19 * 12 - 15 * 12) * 100 : 0
    } else if (plan === "team") {
      return annual ? (49 * 12 - 39 * 12) * 100 : 0
    }
    return 0
  }

  // Format currency 
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: annual ? 0 : 2,
    }).format(amount / 100)
  }

  // Handle Paystack checkout
  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      })
      return
    }

    try {
      setInitializingPayment(true)

      // Initialize Paystack payment
      const paystackRef = await initializePaystack({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: user.email,
        amount: getAmount(),
        currency: "USD",
        metadata: {
          plan_type: plan,
          is_annual: annual,
          user_id: user.id,
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan
            },
            {
              display_name: "Billing",
              variable_name: "billing",
              value: annual ? "annual" : "monthly"
            }
          ]
        },
        callback_url: `${window.location.origin}/subscribe/success?plan=${plan}&annual=${annual}`
      })

      // Paystack will handle the redirect in the popup
      console.log("Paystack payment initialized:", paystackRef)
    } catch (error) {
      console.error("Payment initialization error:", error)

      toast({
        title: "Payment initialization failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      })
    } finally {
      setInitializingPayment(false)
    }
  }

  if (loading || verifyingPayment) {
    return (
      <div className="container max-w-4xl py-16 px-4">
        <Card3D className="p-8 text-center glossy-card" intensity="medium">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>{verifyingPayment ? "Verifying payment..." : "Loading subscription details..."}</p>
        </Card3D>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="container max-w-4xl py-16 px-4">
        <Card3D className="p-8 text-center glossy-card" intensity="medium">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6">
            Your subscription to the {plan.toUpperCase()} plan has been activated. Thank you for subscribing!
          </p>
          <GlassButton asChild className="glossy-button">
            <Link href="/dashboard">Go to Dashboard</Link>
          </GlassButton>
        </Card3D>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-16 px-4">
      <div className="mb-8">
        <Link
          href="/pricing"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pricing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-6 text-glow">Subscribe to {plan === "pro" ? "Pro" : "Team"} Plan</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="billing-toggle">Billing Cycle</Label>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${!annual ? "text-primary" : "text-muted-foreground"}`}>Monthly</span>
                <Switch id="billing-toggle" checked={annual} onCheckedChange={setAnnual} />
                <span className={`text-sm ${annual ? "text-primary" : "text-muted-foreground"}`}>
                  Annual <span className="text-xs text-emerald-500 font-semibold">Save 20%</span>
                </span>
              </div>
            </div>
          </div>

          <Card3D className="p-6 mb-8 glossy-card" intensity="low">
            <h3 className="text-lg font-medium mb-4">Plan Features</h3>
            <ul className="space-y-3">
              {plan === "pro" ? (
                <>
                  <Feature>Unlimited mockups</Feature>
                  <Feature>All templates</Feature>
                  <Feature>All export formats</Feature>
                  <Feature>Bulk generation (up to 10 mockups)</Feature>
                  <Feature>Custom branding</Feature>
                  <Feature>Priority support</Feature>
                </>
              ) : (
                <>
                  <Feature>Everything in Pro</Feature>
                  <Feature>Team collaboration (up to 5 members)</Feature>
                  <Feature>Bulk generation (up to 50 mockups)</Feature>
                  <Feature>API access</Feature>
                  <Feature>Dedicated support</Feature>
                  <Feature>White labeling</Feature>
                </>
              )}
            </ul>
          </Card3D>
        </div>

        <div>
          <Card3D className="p-6 glossy-card" intensity="medium">
            <h3 className="text-xl font-bold mb-4 text-glow">Subscribe to {plan === "pro" ? "Pro" : "Team"} Plan</h3>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span>Plan:</span>
                <span className="font-medium">{plan === "pro" ? "Pro" : "Team"}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Billing:</span>
                <span className="font-medium">{annual ? "Annual" : "Monthly"}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Base Amount:</span>
                <span className="font-medium">
                  {formatAmount(getAmount())}
                  {annual ? "/year" : "/month"}
                </span>
              </div>

              {annual && (
                <div className="flex justify-between mb-2 text-emerald-500">
                  <span>Annual Discount:</span>
                  <span className="font-medium">- {formatAmount(getDiscountAmount())}</span>
                </div>
              )}

              <div className="border-t border-border/40 mt-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    {formatAmount(getAmount())}
                    {annual ? "/year" : "/month"}
                  </span>
                </div>
              </div>

              {annual && (
                <div className="text-sm text-emerald-500 text-right mt-1">
                  You save 20% with annual billing!
                </div>
              )}
            </div>

            <GlassButton
              variant="gradient"
              className="w-full glossy-button"
              onClick={handleCheckout}
              disabled={initializingPayment || !user}
            >
              {initializingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay with Paystack ${formatAmount(getAmount())} ${annual ? "/year" : "/month"}`
              )}
            </GlassButton>

            <div className="mt-4 text-xs text-center text-muted-foreground">
              By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription at any
              time.
            </div>
          </Card3D>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  )
}
