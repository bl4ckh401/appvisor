import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { initializePayment } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const { plan, is_annual, callback_url } = await request.json()

    if (!plan || !callback_url) {
      return NextResponse.json({ error: "Plan and callback URL are required" }, { status: 400 })
    }

    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile for email
    const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", user.id).single()

    const email = profile?.email || user.email
    const name = profile?.full_name || email

    // Initialize payment with Paystack
    const paymentData = await initializePayment({
      email,
      amount: getPlanAmount(plan, is_annual),
      plan: getPlanCode(plan, is_annual),
      callback_url,
      metadata: {
        user_id: user.id,
        plan,
        is_annual: is_annual ? true : false,
      },
    })

    if (!paymentData || !paymentData.authorization_url) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
    }

    // Return payment URL and reference
    return NextResponse.json({
      authorization_url: paymentData.authorization_url,
      reference: paymentData.reference,
    })
  } catch (error) {
    console.error("Error initializing payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to get plan amount in kobo (Paystack uses kobo)
function getPlanAmount(plan: string, is_annual: boolean): number {
  const prices = {
    pro: {
      monthly: 1900, // $19
      annual: 15000, // $150 ($12.50/month)
    },
    team: {
      monthly: 4900, // $49
      annual: 39000, // $390 ($32.50/month)
    },
  }

  const planPrices = prices[plan] || prices.pro
  const amount = is_annual ? planPrices.annual : planPrices.monthly

  // Convert to kobo (multiply by 100)
  return amount * 100
}

// Helper function to get Paystack plan code
function getPlanCode(plan: string, is_annual: boolean): string {
  // These would be your actual Paystack plan codes
  const planCodes = {
    pro: {
      monthly: process.env.NEXT_PUBLIC_PAYSTACK_PRO_MONTHLY_PLAN,
      annual: process.env.NEXT_PUBLIC_PAYSTACK_PRO_ANNUAL_PLAN,
    },
    team: {
      monthly: process.env.NEXT_PUBLIC_PAYSTACK_TEAM_MONTHLY_PLAN,
      annual: process.env.NEXT_PUBLIC_PAYSTACK_TEAM_ANNUAL_PLAN,
    },
  }

  const codes = planCodes[plan] || planCodes.pro
  return is_annual ? codes.annual : codes.monthly
}
