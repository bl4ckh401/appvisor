import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { verifyPayment } from "@/lib/paystack"

export async function GET(request: NextRequest) {
  try {
    // Get reference from query params
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
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

    // Verify payment with Paystack
    const paymentData = await verifyPayment(reference)

    if (!paymentData || !paymentData.status || paymentData.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Extract metadata
    const metadata = paymentData.metadata || {}
    const plan = metadata.plan || "pro"
    const is_annual = metadata.is_annual === true

    // Calculate subscription period
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + (is_annual ? 12 : 1))

    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (existingSub) {
      // Update existing subscription
      await supabase
        .from("user_subscriptions")
        .update({
          plan,
          is_annual,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          payment_reference: reference,
          updated_at: now.toISOString(),
        })
        .eq("id", existingSub.id)
    } else {
      // Create new subscription
      await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        plan,
        status: "active",
        is_annual,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payment_reference: reference,
      })
    }

    // Record payment
    await supabase.from("payments").insert({
      user_id: user.id,
      amount: paymentData.amount / 100, // Convert from kobo to naira/dollars
      status: "successful",
      reference,
      plan,
      is_annual,
    })

    // Return success response
    return NextResponse.json({
      success: true,
      plan,
      is_annual,
      reference,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
