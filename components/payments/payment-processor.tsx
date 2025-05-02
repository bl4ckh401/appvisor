"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card3D } from "@/components/ui/card-3d"
import { GlassButton } from "@/components/ui/glass-button"
import { initializePaystack } from "@/lib/paystack"
import { useToast } from "@/hooks/use-toast"
import { planFeatures } from "@/lib/plan-restrictions"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, CheckCircle, AlertCircle, Calendar, Shield } from "lucide-react"

interface PaymentProcessorProps {
  plan: "pro" | "team"
  email: string
  isAnnual?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function PaymentProcessor({ plan, email, isAnnual = false, onSuccess, onError }: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planDetails, setPlanDetails] = useState<{ code: string, amount: number } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Get plan details on component mount
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        // You could fetch plan details from your backend for more flexibility
        // For now, we'll use hardcoded values based on your existing code
        const planCode = isAnnual 
          ? plan === "pro" ? "PLN_pro_annual" : "PLN_team_annual"
          : plan === "pro" ? "PLN_pro_monthly" : "PLN_team_monthly";
        
        const amount = isAnnual 
          ? plan === "pro" ? 15 * 12 * 100 : 39 * 12 * 100 // Convert to cents
          : plan === "pro" ? 19 * 100 : 49 * 100; // Convert to cents
          
        setPlanDetails({ code: planCode, amount });
      } catch (error) {
        console.error("Error fetching plan details:", error);
        setError("Failed to load subscription details. Please try again.");
      } finally {
        setInitializing(false);
      }
    };
    
    fetchPlanDetails();
  }, [plan, isAnnual]);

  const handleCheckout = async () => {
    if (!planDetails) return;
    
    try {
      setLoading(true)
      setError(null)

      // Initialize Paystack payment
      const reference = await initializePaystack({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email,
        amount: planDetails.amount,
        currency: "USD",
        plan: planDetails.code,
        metadata: {
          plan_type: plan,
          is_annual: isAnnual,
        },
        callback_url: `${window.location.origin}/subscribe/success`
      })

      setProcessing(true)

      // Verify payment on the server
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Payment verification failed")
      }

      const verificationResult = await response.json()

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
  
  // Helper function to format price based on plan
  const formatPrice = () => {
    if (plan === "pro") {
      return isAnnual ? "$180" : "$19"
    } else {
      return isAnnual ? "$468" : "$49"
    }
  }
  
  // Helper function to format period
  const formatPeriod = () => {
    return isAnnual ? "/year" : "/month"
  }
  
  // Format features list based on plan
  const getFeaturesList = () => {
    const features = [];
    
    if (plan === "pro") {
      features.push(`${planFeatures.pro.mockupsPerMonth === Number.POSITIVE_INFINITY ? "Unlimited" : planFeatures.pro.mockupsPerMonth} mockups`);
      features.push(`Up to ${planFeatures.pro.bulkGeneration} bulk generations`);
      features.push("All export formats");
      features.push("Priority support");
    } else {
      features.push(`${planFeatures.team.mockupsPerMonth === Number.POSITIVE_INFINITY ? "Unlimited" : planFeatures.team.mockupsPerMonth} mockups`);
      features.push(`Up to ${planFeatures.team.bulkGeneration} bulk generations`);
      features.push(`${planFeatures.team.teamMembers} team members`);
      features.push("API access");
      features.push("White labeling");
    }
    
    return features;
  }

  if (initializing) {
    return (
      <Card3D className="p-6 glossy-card" intensity="medium">
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card3D>
    );
  }

  return (
    <Card3D className="p-6 glossy-card" intensity="medium">
      <h3 className="text-xl font-bold mb-4 text-glow">Subscribe to {plan === "pro" ? "Pro" : "Team"} Plan</h3>
      
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{formatPrice()}</span>
            <span className="text-muted-foreground ml-1">{formatPeriod()}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`mt-1 bg-${plan === "pro" ? "lime" : "purple"}-500/20 text-${plan === "pro" ? "lime" : "purple"}-500`}
          >
            {plan.toUpperCase()} PLAN
          </Badge>
          {isAnnual && (
            <div className="text-sm text-emerald-500 mt-1">You save 20% with annual billing!</div>
          )}
        </div>
      </div>

      <div className="border-t border-border/30 pt-4 mb-6">
        <h4 className="font-medium mb-3">Plan Features</h4>
        <ul className="space-y-2">
          {getFeaturesList().map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
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
        <Calendar className="inline-block h-3 w-3 mr-1" />
        {isAnnual ? "Annual" : "Monthly"} subscription. Cancel anytime.
      </div>
      
      <div className="mt-2 text-xs text-center text-muted-foreground">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
      </div>
    </Card3D>
  )
}
