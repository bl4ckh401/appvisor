import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { planFeatures } from "@/lib/plan-restrictions-server"

export async function GET(request: NextRequest) {
  try {
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

    // Get user's current subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    // Format plan details
    const plans = {
      free: {
        name: "Free",
        price: {
          monthly: 0,
          annual: 0,
        },
        features: planFeatures.free,
      },
      pro: {
        name: "Pro",
        price: {
          monthly: 19,
          annual: 15 * 12, // $15/month billed annually
        },
        features: planFeatures.pro,
      },
      team: {
        name: "Team",
        price: {
          monthly: 49,
          annual: 39 * 12, // $39/month billed annually
        },
        features: planFeatures.team,
      },
    }

    // Add current plan info
    const currentPlan = subscription?.plan || "free"

    return NextResponse.json({
      plans,
      currentPlan,
      subscription: subscription || null,
    })
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
