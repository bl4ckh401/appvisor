// app/api/feature-usage/track/route.ts
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateRequestId } from "@/lib/error-monitoring"

export async function POST(request: Request) {
  const requestId = generateRequestId()
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get request body
    const body = await request.json()
    const { feature, metadata } = body
    
    if (!feature) {
      return NextResponse.json({ error: "Feature is required" }, { status: 400 })
    }
    
    console.log(`Tracking feature usage: ${feature} for user ${user.id} - RequestID: ${requestId}`)
    
    // Insert usage record
    const { error } = await supabase
      .from("feature_usage")
      .insert({
        user_id: user.id,
        feature,
        count: 1,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      })
    
    if (error) {
      // If table doesn't exist, try to create it
      if (error.code === "42P01") {
        console.log("Feature usage table doesn't exist, attempting to create it...")
        
        // Try to create the table
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.feature_usage (
              id SERIAL PRIMARY KEY,
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              feature TEXT NOT NULL,
              count INTEGER NOT NULL DEFAULT 1,
              timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
              metadata JSONB
            );
            
            CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON public.feature_usage(user_id);
            CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON public.feature_usage(feature);
            CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON public.feature_usage(timestamp);
            CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature_timestamp ON public.feature_usage(user_id, feature, timestamp);
            
            ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own usage" ON public.feature_usage
              FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert their own usage" ON public.feature_usage
              FOR INSERT WITH CHECK (auth.uid() = user_id);
          `
        })
        
        if (createError) {
          console.error("Failed to create feature_usage table:", createError)
          // Continue anyway - don't block the user
        } else {
          // Try to insert again
          const { error: retryError } = await supabase
            .from("feature_usage")
            .insert({
              user_id: user.id,
              feature,
              count: 1,
              metadata: metadata || {},
              timestamp: new Date().toISOString()
            })
          
          if (!retryError) {
            return NextResponse.json({ success: true })
          }
        }
      }
      
      console.error("Error tracking feature usage:", error)
      // Don't fail the request - just log the error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in feature usage tracking:", error)
    // Don't fail the request - usage tracking shouldn't block functionality
    return NextResponse.json({ success: true })
  }
}
