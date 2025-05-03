import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json()

    // Verify webhook signature (implementation depends on payment provider)
    // This is a simplified example

    // Get supabase client
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Process webhook event
    const event = body.event
    const data = body.data

    switch (event) {
      case "subscription.create":
        // Handle subscription creation
        await handleSubscriptionCreated(supabase, data)
        break

      case "subscription.update":
        // Handle subscription update
        await handleSubscriptionUpdated(supabase, data)
        break

      case "subscription.cancel":
        // Handle subscription cancellation
        await handleSubscriptionCancelled(supabase, data)
        break

      case "charge.success":
        // Handle successful payment
        await handlePaymentSuccess(supabase, data)
        break

      case "charge.failed":
        // Handle failed payment
        await handlePaymentFailed(supabase, data)
        break

      default:
        // Ignore other events
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper functions for handling different webhook events

async function handleSubscriptionCreated(supabase, data) {
  // Extract subscription details
  const { id, customer_id, plan, status, start_date, end_date, is_annual } = data

  // Find user by customer ID
  const { data: user } = await supabase.from("users").select("id").eq("customer_id", customer_id).single()

  if (!user) {
    console.error(`User not found for customer ID: ${customer_id}`)
    return
  }

  // Create subscription record
  await supabase.from("user_subscriptions").insert({
    id,
    user_id: user.id,
    plan,
    status,
    current_period_start: start_date,
    current_period_end: end_date,
    is_annual,
    payment_reference: data.reference,
  })
}

async function handleSubscriptionUpdated(supabase, data) {
  // Extract subscription details
  const { id, plan, status, start_date, end_date, is_annual } = data

  // Update subscription record
  await supabase
    .from("user_subscriptions")
    .update({
      plan,
      status,
      current_period_start: start_date,
      current_period_end: end_date,
      is_annual,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
}

async function handleSubscriptionCancelled(supabase, data) {
  // Extract subscription ID
  const { id } = data

  // Update subscription status
  await supabase
    .from("user_subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
}

async function handlePaymentSuccess(supabase, data) {
  // Extract payment details
  const { subscription_id, amount, reference } = data

  // Update subscription with payment info
  if (subscription_id) {
    await supabase
      .from("user_subscriptions")
      .update({
        last_payment_date: new Date().toISOString(),
        last_payment_amount: amount,
        payment_reference: reference,
      })
      .eq("id", subscription_id)
  }

  // Record payment in payments table
  await supabase.from("payments").insert({
    subscription_id,
    amount,
    status: "successful",
    reference,
  })
}

async function handlePaymentFailed(supabase, data) {
  // Extract payment details
  const { subscription_id, amount, reference, failure_reason } = data

  // Record failed payment
  await supabase.from("payments").insert({
    subscription_id,
    amount,
    status: "failed",
    reference,
    failure_reason,
  })

  // Update subscription status if needed
  if (subscription_id) {
    // Check if this is a recurring payment failure
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("failed_payment_count")
      .eq("id", subscription_id)
      .single()

    if (subscription) {
      const failedCount = (subscription.failed_payment_count || 0) + 1

      // Update subscription with failed payment count
      await supabase
        .from("user_subscriptions")
        .update({
          failed_payment_count: failedCount,
          // If too many failures, mark as past_due
          status: failedCount >= 3 ? "past_due" : "active",
        })
        .eq("id", subscription_id)
    }
  }
}
