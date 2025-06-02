// app/api/usage/summary/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { planFeatures } from "@/lib/plan-restrictions"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get user's subscription
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
    
    const userPlan = subscription?.plan || "free"
    
    // Get current month's start
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Get all usage for current month
    const { data: usageData, error } = await supabase
      .from("feature_usage")
      .select("feature, count, timestamp, metadata")
      .eq("user_id", user.id)
      .gte("timestamp", firstDayOfMonth.toISOString())
      .lte("timestamp", lastDayOfMonth.toISOString())
      .order("timestamp", { ascending: false })
    
    if (error) {
      console.error("Error fetching usage data:", error)
      
      // If table doesn't exist, return empty usage
      if (error.code === '42P01') {
        return NextResponse.json({
          plan: userPlan,
          usage: {
            mockup_generation: 0,
            gpt_image_generation: 0,
            gpt_image_editing: 0,
            bulk_generation: 0,
          },
          limits: {
            mockup_generation: planFeatures[userPlan].mockupsPerMonth,
            gpt_image_generation: planFeatures[userPlan].gptImageGenerationsPerMonth || 5,
            gpt_image_editing: planFeatures[userPlan].gptImageGenerationsPerMonth || 5,
            bulk_generation: planFeatures[userPlan].bulkGeneration,
          },
          remaining: {
            mockup_generation: planFeatures[userPlan].mockupsPerMonth,
            gpt_image_generation: planFeatures[userPlan].gptImageGenerationsPerMonth || 5,
            gpt_image_editing: planFeatures[userPlan].gptImageGenerationsPerMonth || 5,
            bulk_generation: planFeatures[userPlan].bulkGeneration,
          },
          period: {
            start: firstDayOfMonth.toISOString(),
            end: lastDayOfMonth.toISOString()
          }
        })
      }
      
      return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 })
    }
    
    // Aggregate usage by feature
    const usageByFeature = usageData?.reduce((acc, item) => {
      acc[item.feature] = (acc[item.feature] || 0) + item.count
      return acc
    }, {} as Record<string, number>) || {}
    
    // Define limits based on plan using planFeatures
    const limits = {
      mockup_generation: planFeatures[userPlan].mockupsPerMonth,
      gpt_image_generation: planFeatures[userPlan].gptImageGenerationsPerMonth || 5,
      gpt_image_editing: planFeatures[userPlan].gptImageGenerationsPerMonth || 5,
      bulk_generation: planFeatures[userPlan].bulkGeneration,
    }
    
    // Calculate remaining for each feature
    const remaining = Object.keys(limits).reduce((acc, feature) => {
      const used = usageByFeature[feature] || 0
      const limit = limits[feature as keyof typeof limits]
      
      if (limit === Number.POSITIVE_INFINITY) {
        acc[feature] = "Unlimited"
      } else {
        acc[feature] = Math.max(0, limit - used)
      }
      
      return acc
    }, {} as Record<string, number | string>)
    
    return NextResponse.json({
      plan: userPlan,
      usage: usageByFeature,
      limits,
      remaining,
      period: {
        start: firstDayOfMonth.toISOString(),
        end: lastDayOfMonth.toISOString(),
        daysRemaining: Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    })
  } catch (error) {
    console.error("Error in usage summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
