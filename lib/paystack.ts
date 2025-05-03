// Initialize Paystack payment
export async function initializePaystack(data: {
  email: string
  amount: number
  plan?: string
  callback_url?: string
  metadata?: any
}) {
  try {
    const response = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to initialize payment")
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("Error initializing payment:", error)
    throw error
  }
}

// Alias for initializePaystack to maintain compatibility
export const initializePayment = initializePaystack

// Verify Paystack payment
export async function verifyPayment(reference: string) {
  try {
    const response = await fetch(`/api/payments/verify?reference=${reference}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to verify payment")
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("Error verifying payment:", error)
    throw error
  }
}

// Get Paystack plans
export async function getPlans() {
  try {
    const response = await fetch("/api/payments/plans", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch plans")
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("Error fetching plans:", error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await fetch("/api/payments/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription_id: subscriptionId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to cancel subscription")
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw error
  }
}
