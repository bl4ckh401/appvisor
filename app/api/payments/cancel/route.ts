import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get subscription ID from request body
    const { subscription_id } = await request.json()

    if (!subscription_id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
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

    // Verify that the subscription belongs to the user
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .eq("user_id", user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Update subscription status to canceled
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription_id)

    if (updateError) {
      console.error("Error canceling subscription:", updateError)
      return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
    })
  } catch (error) {
    console.error("Error in cancel subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
