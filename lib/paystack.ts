// Paystack integration utility
import { createClient } from "@/lib/supabase/client"

export interface PaystackPlan {
  id: string
  name: string
  amount: number
  interval: "monthly" | "annually"
  currency: string
  code: string
}

export interface PaystackConfig {
  publicKey: string
  email: string
  amount: number // in kobo (for NGN) or cents (for USD)
  currency?: string
  plan?: string
  metadata?: Record<string, any>
}

export interface PaystackResponse {
  reference: string
  status: string
  transaction: string
  message: string
}

// Initialize Paystack checkout
export const initializePaystack = (config: PaystackConfig): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if Paystack script is already loaded
    if (window.PaystackPop) {
      openPaystackPopup(config, resolve, reject)
    } else {
      // Load Paystack script if not already loaded
      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true

      script.onload = () => {
        openPaystackPopup(config, resolve, reject)
      }

      script.onerror = () => {
        reject(new Error("Could not load Paystack script"))
      }

      document.body.appendChild(script)
    }
  })
}

// Helper function to open Paystack popup
const openPaystackPopup = (
  config: PaystackConfig,
  resolve: (value: string) => void,
  reject: (reason: Error) => void,
) => {
  const handler = window.PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo/cents
    currency: config.currency || "USD",
    plan: config.plan,
    metadata: config.metadata || {},
    onClose: () => {
      reject(new Error("Payment window closed"))
    },
    callback: (response: PaystackResponse) => {
      resolve(response.reference)
    },
  })

  handler.openIframe()
}

// Verify payment on the server
export const verifyPayment = async (reference: string): Promise<any> => {
  try {
    const response = await fetch(`/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference }),
    })

    if (!response.ok) {
      throw new Error("Payment verification failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Payment verification error:", error)
    throw error
  }
}

// Create a subscription for a user
export const createSubscription = async (
  planCode: string,
  email: string,
  isAnnual: boolean,
): Promise<{ reference: string }> => {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Initialize transaction with plan code
    const response = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        plan: planCode,
        metadata: {
          user_id: user.id,
          is_annual: isAnnual,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to initialize payment")
    }

    const data = await response.json()
    return { reference: data.data.reference }
  } catch (error) {
    console.error("Subscription creation error:", error)
    throw error
  }
}

// Get available plans
export const getPlans = async (): Promise<PaystackPlan[]> => {
  try {
    const response = await fetch("/api/payments/plans", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch plans")
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching plans:", error)
    return []
  }
}

// Get user's active subscription
export const getUserSubscription = async () => {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (error) {
      console.error("Error fetching subscription:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return null
  }
}
