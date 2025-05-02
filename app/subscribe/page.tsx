"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card3D } from "@/components/ui/card-3d"
import { PaymentProcessor } from "@/components/payments/payment-processor"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SubscribePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [annual, setAnnual] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const planParam = searchParams.get("plan") || "pro"
  const plan = planParam === "team" ? "team" : "pro"

  // Calculate amount based on plan and billing cycle
  const getAmount = () => {
    if (plan === "pro") {
      return annual ? 180 : 19
    } else if (plan === "team") {
      return annual ? 468 : 49
    }
    return 0
  }

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

  const handlePaymentSuccess = async () => {
    try {
      // Update user subscription in database
      const { error } = await supabase.from("user_subscriptions").upsert({
        user_id: user.id,
        plan: plan,
        status: "active",
        is_annual: annual,
        expires_at: new Date(Date.now() + (annual ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      })

      if (error) {
        console.error("Error updating subscription:", error)
      }
    } catch (error) {
      console.error("Subscription update error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card3D className="p-8 text-center glossy-card" intensity="medium">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading subscription details...</p>
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
          <PaymentProcessor
            plan={plan}
            amount={getAmount()}
            email={user?.email || ""}
            isAnnual={annual}
            onSuccess={handlePaymentSuccess}
          />

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
