// Import required dependencies
import { createClient } from "@/lib/supabase/client"

export interface PaystackConfig {
  publicKey: string
  email: string
  amount: number // in cents for USD
  currency?: string
  plan?: string
  metadata?: Record<string, any>
  callback_url?: string
}

// Initialize Paystack checkout
export const initializePaystack = (config: PaystackConfig): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Use inline embed approach as recommended by Paystack docs
    if (window.PaystackPop) {
      openPaystackPopup(config, resolve, reject)
    } else {
      // Load Paystack script dynamically if not already loaded
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
    amount: config.amount, // Paystack expects amount in lowest currency unit (cents for USD)
    currency: config.currency || "USD",
    plan: config.plan,
    metadata: config.metadata || {},
    callback_url: config.callback_url,
    onClose: () => {
      reject(new Error("Payment window closed"))
    },
    callback: (response: any) => {
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
      const errorData = await response.json()
      throw new Error(errorData.error || "Payment verification failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Payment verification error:", error)
    throw error
  }
}
