"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card3D } from "@/components/ui/card-3d"
import { GlassButton } from "@/components/ui/glass-button"
import { initializePaystack, verifyPayment } from "@/lib/paystack"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react"

interface PaymentProcessorProps {
  plan: "pro" | "team"
  amount: number
  email: string
  isAnnual?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function PaymentProcessor({ plan, amount, email, isAnnual = false, onSuccess, onError }: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Plan codes from Paystack dashboard
  const planCodes = {
    pro: {
      monthly: process.env.NEXT_PUBLIC_PAYSTACK_PRO_MONTHLY_PLAN || "PLN_pro_monthly",
      annual: process.env.NEXT_PUBLIC_PAYSTACK_PRO_ANNUAL_PLAN || "PLN_pro_annual",
    },
    team: {
      monthly: process.env.NEXT_PUBLIC_PAYSTACK_TEAM_MONTHLY_PLAN || "PLN_team_monthly",
      annual: process.env.NEXT_PUBLIC_PAYSTACK_TEAM_ANNUAL_PLAN || "PLN_team_annual",
    },
  }

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the appropriate plan code
      const planCode = isAnnual ? planCodes[plan].annual : planCodes[plan].monthly

      // Initialize Paystack payment
      const reference = await initializePaystack({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email,
        amount: amount,
        currency: "USD",
        plan: planCode,
        metadata: {
          plan_type: plan,
          is_annual: isAnnual,
        },
      })

      setProcessing(true)

      // Verify payment on the server
      const verificationResult = await verifyPayment(reference)

      // Handle successful payment
      setSuccess(true)
      setProcessing(false)

      toast({
        title: "Payment successful!",
        description: `You are now subscribed to the ${plan.toUpperCase()} plan.`,
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(verificationResult)
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Payment error:", error)
      setProcessing(false)
      setError(error.message || "An error occurred during payment processing.")

      // Show error toast
      toast({
        title: "Payment failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      })

      // Call error callback if provided
      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card3D className="p-6 glossy-card" intensity="medium">
      <h3 className="text-xl font-bold mb-4 text-glow">Subscribe to {plan === "pro" ? "Pro" : "Team"} Plan</h3>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>Plan:</span>
          <span className="font-medium">{plan === "pro" ? "Pro" : "Team"}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span>Billing:</span>
          <span className="font-medium">{isAnnual ? "Annual" : "Monthly"}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span>Amount:</span>
          <span className="font-medium">
            ${amount}
            {isAnnual ? "/year" : "/month"}
          </span>
        </div>

        {isAnnual && <div className="text-sm text-emerald-500 text-right">You save 20% with annual billing!</div>}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {success ? (
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="h-12 w-12 text-emerald-500 mb-2" />
          <p className="text-center font-medium">Payment successful!</p>
          <p className="text-center text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      ) : (
        <GlassButton
          variant="gradient"
          className="w-full glossy-button"
          onClick={handleCheckout}
          disabled={loading || processing}
        >
          {loading || processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processing ? "Processing..." : "Loading..."}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay with Paystack
            </>
          )}
        </GlassButton>
      )}

      <div className="mt-4 text-xs text-center text-muted-foreground">
        By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription at any
        time.
      </div>
    </Card3D>
  )
}
