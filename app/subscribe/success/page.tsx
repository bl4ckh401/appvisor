"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card3D } from "@/components/ui/card-3d"
import { GlassButton } from "@/components/ui/glass-button"
import { verifyPayment } from "@/lib/paystack"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const supabase = createClient()

  useEffect(() => {
    const verifyTransaction = async () => {
      if (!reference) {
        setError("No payment reference found")
        setLoading(false)
        return
      }

      try {
        // Verify the payment
        const result = await verifyPayment(reference)

        if (result.success) {
          setSuccess(true)
        } else {
          setError("Payment verification failed")
        }
      } catch (err) {
        console.error("Verification error:", err)
        setError(err.message || "An error occurred while verifying your payment")
      } finally {
        setLoading(false)
      }
    }

    verifyTransaction()
  }, [reference])

  return (
    <div className="container max-w-md py-16 px-4">
      <Card3D className="p-8 glossy-card" intensity="medium">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Verifying your payment</h2>
            <p className="text-center text-muted-foreground">Please wait while we verify your payment...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-center text-muted-foreground mb-6">
              Your subscription has been activated. Thank you for subscribing!
            </p>
            <GlassButton asChild className="glossy-button">
              <Link href="/dashboard">Go to Dashboard</Link>
            </GlassButton>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Verification Failed</h2>
            <p className="text-center text-muted-foreground mb-2">
              {error || "We couldn't verify your payment. Please try again or contact support."}
            </p>
            <div className="flex gap-4 mt-6">
              <GlassButton variant="outline" asChild>
                <Link href="/pricing">Back to Pricing</Link>
              </GlassButton>
              <GlassButton asChild className="glossy-button">
                <Link href="/contact">Contact Support</Link>
              </GlassButton>
            </div>
          </div>
        )}
      </Card3D>
    </div>
  )
}
