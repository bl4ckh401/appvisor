"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card3D } from "@/components/ui/card-3d"
import { Button3D } from "@/components/ui/button-3d"
import { initializePaystack, verifyPayment } from "@/lib/paystack"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface CheckoutProps {
  plan: "pro" | "team"
  email: string
  isAnnual?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function Checkout({ plan, email, isAnnual = false, onSuccess, onError }: CheckoutProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Calculate amount based on plan and billing cycle
  const getAmount = () => {
    if (plan === "pro") {
      return isAnnual ? 15 * 12 * 100 : 19 * 100 // Convert to cents
    } else if (plan === "team") {
      return isAnnual ? 39 * 12 * 100 : 49 * 100 // Convert to cents
    }
    return 0
  }

  const handleCheckout = async () => {
    try {
      setLoading(true)

      // Initialize Paystack payment
      const reference = await initializePaystack({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email,
        amount: getAmount(),
        currency: "USD",
        metadata: {
          plan_id: plan,
          is_annual: isAnnual,
        },
      })

      // Verify payment on the server
      const verificationResult = await verifyPayment(reference)

      // Handle successful payment
      toast({
        title: "Payment successful!",
        description: `You are now subscribed to the ${plan.toUpperCase()} plan.`,
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(verificationResult)
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Payment error:", error)

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
    <Card3D className="p-6" intensity="medium">
      <h3 className="text-xl font-bold mb-4">Subscribe to {plan === "pro" ? "Pro" : "Team"} Plan</h3>

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
            ${plan === "pro" ? (isAnnual ? "180" : "19") : isAnnual ? "468" : "49"}
            {isAnnual ? "/year" : "/month"}
          </span>
        </div>

        {isAnnual && <div className="text-sm text-emerald-500 text-right">You save 20% with annual billing!</div>}
      </div>

      <Button3D variant="gradient" className="w-full" onClick={handleCheckout} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay with Paystack`
        )}
      </Button3D>

      <div className="mt-4 text-xs text-center text-muted-foreground">
        By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription at any
        time.
      </div>
    </Card3D>
  )
}
