// app/api/payments/webhook/route.ts
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { generateRequestId, logAPIError } from "@/lib/error-monitoring"

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  try {
    // 1. Get the request body
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    // 2. Verify webhook signature for security
    const secret = process.env.PAYSTACK_SECRET_KEY || ""
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")

    if (hash !== signature) {
      console.error(`Invalid Paystack webhook signature - RequestID: ${requestId}`)
      await logAPIError({
        apiName: "paystack",
        endpoint: "webhook",
        errorMessage: "Invalid webhook signature",
        timestamp: new Date(),
        requestId,
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // 3. Parse the event data
    const event = JSON.parse(body)
    console.log(`Received webhook event: ${event.event} - RequestID: ${requestId}`)
    
    const eventType = event.event
    const data = event.data

    const supabase = createClient()

    // 4. Handle different event types
    switch (eventType) {
      case "subscription.create":
        await handleSubscriptionCreate(supabase, data, requestId)
        break
      case "subscription.disable":
        await handleSubscriptionDisable(supabase, data, requestId)
        break
      case "charge.success":
        await handleChargeSuccess(supabase, data, requestId)
        break
      case "invoice.payment_failed":
        await handlePaymentFailed(supabase, data, requestId)
        break
      case "invoice.create":
        // Log the invoice creation event
        console.log(`Invoice created: ${data.reference} - RequestID: ${requestId}`)
        break
      case "subscription.not_renew":
        await handleSubscriptionNotRenew(supabase, data, requestId)
        break
      default:
        console.log(`Unhandled event type: ${eventType} - RequestID: ${requestId}`)
    }

    return NextResponse.json({ received: true, success: true })
  } catch (error) {
    console.error(`Error processing webhook: ${error} - RequestID: ${requestId}`)
    await logAPIError({
      apiName: "paystack",
      endpoint: "webhook",
      errorMessage: `Error processing webhook: ${error.message}`,
      timestamp: new Date(),
      requestId,
      rawError: error,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle subscription creation events
async function handleSubscriptionCreate(supabase: any, data: any, requestId: string) {
  const { customer, plan, subscription_code, email, authorization } = data

  try {
    // 1. Get user by email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (userError) {
      console.error(`User not found for subscription - RequestID: ${requestId}`, { email, error: userError })
      return
    }

    const userId = userData.id

    // 2. Determine plan type and billing cycle
    const planCode = plan.plan_code.toLowerCase()
    let planType: "pro" | "team" = "pro"
    let isAnnual = false

    if (planCode.includes("team")) {
      planType = "team"
    }

    if (planCode.includes("annual")) {
      isAnnual = true
    }

    // 3. Calculate period end date (add a month or a year)
    const now = new Date()
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + (isAnnual ? 365 : 30))

    // 4. Create or update subscription record
    const { data: existingSub, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (existingSub) {
      // Update existing subscription
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          plan: planType,
          status: "active",
          payment_reference: subscription_code,
          is_annual: isAnnual,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existingSub.id)

      if (error) {
        console.error(`Error updating subscription record - RequestID: ${requestId}`, error)
      }
    } else {
      // Create new subscription
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
        console.error(`Error creating subscription record - RequestID: ${requestId}`, error)
      }
    }

    console.log(`Successfully processed subscription.create for user ${userId} - RequestID: ${requestId}`)
  } catch (error) {
    console.error(`Error in handleSubscriptionCreate - RequestID: ${requestId}`, error)
  }
}

// Handle subscription cancellation/disable events
async function handleSubscriptionDisable(supabase: any, data: any, requestId: string) {
  const { subscription_code } = data

  try {
    // Update subscription status to canceled
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ 
        status: "canceled",
        updated_at: new Date().toISOString() 
      })
      .eq("payment_reference", subscription_code)

    if (error) {
      console.error(`Error updating subscription status - RequestID: ${requestId}`, error)
    } else {
      console.log(`Successfully processed subscription.disable - RequestID: ${requestId}`)
    }
  } catch (error) {
    console.error(`Error in handleSubscriptionDisable - RequestID: ${requestId}`, error)
  }
}

// Handle successful charge events (renewals)
async function handleChargeSuccess(supabase: any, data: any, requestId: string) {
  const { reference, amount, customer, metadata } = data

  try {
    // If this is a subscription renewal, update the subscription period
    if (metadata?.subscription_code) {
      const now = new Date()
      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + (metadata.is_annual ? 365 : 30))

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("payment_reference", metadata.subscription_code)

      if (error) {
        console.error(`Error updating subscription period - RequestID: ${requestId}`, error)
      } else {
        console.log(`Successfully processed charge.success for subscription - RequestID: ${requestId}`)
      }
    } else {
      // Handle one-time payments if needed
      console.log(`Processed one-time payment: ${reference} - RequestID: ${requestId}`)
    }
  } catch (error) {
    console.error(`Error in handleChargeSuccess - RequestID: ${requestId}`, error)
  }
}

// Handle payment failure events
async function handlePaymentFailed(supabase: any, data: any, requestId: string) {
  const { subscription_code } = data

  try {
    // Mark subscription as expired
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ 
        status: "expired",
        updated_at: new Date().toISOString() 
      })
      .eq("payment_reference", subscription_code)

    if (error) {
      console.error(`Error updating subscription status - RequestID: ${requestId}`, error)
    } else {
      console.log(`Successfully processed payment.failed - RequestID: ${requestId}`)
    }
  } catch (error) {
    console.error(`Error in handlePaymentFailed - RequestID: ${requestId}`, error)
  }
}

// Handle subscription not renewing events
async function handleSubscriptionNotRenew(supabase: any, data: any, requestId: string) {
  const { subscription_code } = data

  try {
    // Update the subscription to indicate it won't renew
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ 
        status: "canceled", 
        updated_at: new Date().toISOString()
      })
      .eq("payment_reference", subscription_code)

    if (error) {
      console.error(`Error updating subscription for non-renewal - RequestID: ${requestId}`, error)
    } else {
      console.log(`Successfully processed subscription.not_renew - RequestID: ${requestId}`)
    }
  } catch (error) {
    console.error(`Error in handleSubscriptionNotRenew - RequestID: ${requestId}`, error)
  }
}
