import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY || ""
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")

    if (hash !== signature) {
      console.error("Invalid Paystack webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const eventType = event.event
    const data = event.data

    const supabase = createClient()

    // Handle different event types
    switch (eventType) {
      case "subscription.create":
        await handleSubscriptionCreate(supabase, data)
        break
      case "subscription.disable":
        await handleSubscriptionDisable(supabase, data)
        break
      case "charge.success":
        await handleChargeSuccess(supabase, data)
        break
      case "invoice.payment_failed":
        await handlePaymentFailed(supabase, data)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleSubscriptionCreate(supabase: any, data: any) {
  const { customer, plan, subscription_code, email, authorization } = data

  // Get user by email
  const { data: userData, error: userError } = await supabase.from("profiles").select("id").eq("email", email).single()

  if (userError || !userData) {
    console.error("User not found for subscription", { email, error: userError })
    return
  }

  const userId = userData.id

  // Determine plan type from metadata or plan code
  const planCode = plan.plan_code
  let planType: "pro" | "team" = "pro"
  let isAnnual = false

  if (planCode.includes("team")) {
    planType = "team"
  }

  if (planCode.includes("annual")) {
    isAnnual = true
  }

  // Calculate period end date
  const now = new Date()
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + (isAnnual ? 365 : 30))

  // Create subscription record
  const { error } = await supabase.from("user_subscriptions").insert({
    user_id: userId,
    plan: planType,
    status: "active",
    payment_reference: subscription_code,
    is_annual: isAnnual,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
  })

  if (error) {
    console.error("Error creating subscription record", error)
  }
}

async function handleSubscriptionDisable(supabase: any, data: any) {
  const { subscription_code } = data

  // Update subscription status
  const { error } = await supabase
    .from("user_subscriptions")
    .update({ status: "canceled" })
    .eq("payment_reference", subscription_code)

  if (error) {
    console.error("Error updating subscription status", error)
  }
}

async function handleChargeSuccess(supabase: any, data: any) {
  const { reference, amount, customer, metadata } = data

  // If this is a subscription renewal, update the subscription period
  if (metadata?.subscription_code) {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + (metadata.is_annual ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("payment_reference", metadata.subscription_code)

    if (error) {
      console.error("Error updating subscription period", error)
    }
  }
}

async function handlePaymentFailed(supabase: any, data: any) {
  const { subscription_code } = data

  // Mark subscription as expired
  const { error } = await supabase
    .from("user_subscriptions")
    .update({ status: "expired" })
    .eq("payment_reference", subscription_code)

  if (error) {
    console.error("Error updating subscription status", error)
  }
}
