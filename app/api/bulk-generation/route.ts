// app/api/bulk-generation/route.ts
import { NextResponse } from "next/server"
import { checkSubscription } from "@/lib/subscription-middleware"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"
import { trackFeatureUsage } from "@/lib/usage-tracking"
import { planFeatures } from "@/lib/plan-restrictions"

export async function POST(req: Request) {
  const requestId = generateRequestId()
  
  // 1. Apply subscription middleware - require pro plan with bulk generation feature
  const modifiedReq = await checkSubscription("pro", "bulkGeneration")(req)
  
  // If modifiedReq is a Response, it means the middleware returned an error
  if (modifiedReq instanceof Response) {
    return modifiedReq
  }
  
  try {
    // Get user info from request headers (added by middleware)
    const userId = modifiedReq.headers.get("x-user-id")
    const userPlan = modifiedReq.headers.get("x-user-plan")
    
    // 2. Parse request body
    const body = await modifiedReq.json()
    const { prompts, provider = "gemini", aspectRatio = "9:16" } = body
    
    // 3. Validate prompts
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "bulk-generation",
          endpoint: "generate",
          errorMessage: "Prompts array is required",
          timestamp: new Date(),
          requestId,
          userId,
        }),
        { status: 400 }
      )
    }
    
    // 4. Get user's bulk generation limit based on plan
    const bulkLimit = planFeatures[userPlan].bulkGeneration
    
    // 5. Limit number of prompts based on subscription
    const limitedPrompts = prompts.slice(0, bulkLimit)
    
    if (limitedPrompts.length < prompts.length) {
      console.log(`User ${userId} attempted to generate ${prompts.length} mockups, limited to ${bulkLimit} - RequestID: ${requestId}`)
    }
    
    // 6. Track usage
    await trackFeatureUsage("bulk_generation", { 
      count: limitedPrompts.length,
      provider
    })
    
    // 7. Process each prompt (in a real implementation, you would call your image generation services)
    const results = []
    
    for (const prompt of limitedPrompts) {
      try {
        // Choose API endpoint based on provider
        const endpoint = provider === "openai" ? "/api/generate-image" : "/api/gemini/generate-image"
        
        // Call the appropriate API
        const response = await fetch(new URL(endpoint, process.env.NEXT_PUBLIC_APP_URL).toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Pass through the authentication headers
            "Cookie": modifiedReq.headers.get("cookie") || "",
          },
          body: JSON.stringify({
            prompt,
            aspectRatio
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `API error: ${response.status}`)
        }
        
        const data = await response.json()
        
        results.push({
          prompt,
          success: true,
          url: data.url,
          imageData: data.imageData
        })
      } catch (error) {
        // Don't fail the entire request if one prompt fails
        results.push({
          prompt,
          success: false,
          error: error.message || "Failed to generate image"
        })
      }
    }
    
    // 8. Return results
    return NextResponse.json({
      count: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      requestId
    })
    
  } catch (error) {
    console.error(`Bulk generation error: ${error} - RequestID: ${requestId}`)
    
    return NextResponse.json(
      createErrorResponse({
        apiName: "bulk-generation",
        endpoint: "generate",
        errorMessage: "Error processing bulk generation request",
        timestamp: new Date(),
        requestId,
        userId: modifiedReq.headers.get("x-user-id"),
        rawError: error,
      }),
      { status: 500 }
    )
  }
}
