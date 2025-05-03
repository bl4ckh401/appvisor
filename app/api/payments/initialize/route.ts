import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"

export async function POST(request: Request) {
  const requestId = generateRequestId()
  console.log(`[${new Date().toISOString()}] Received POST /api/payments/initialize - RequestID: ${requestId}`)

  // 1. Authentication check
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "payments",
        endpoint: "initialize",
        errorMessage: "Unauthorized: Authentication required",
        timestamp: new Date(),
        requestId,
      }),
      { status: 401 },
    )
  }

  const userId = session.user.id

  // 2. Parse request body
  let body
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "payments",
        endpoint: "initialize",
        errorMessage: "Invalid request format: Malformed JSON",
        timestamp: new Date(),
        requestId,
        userId,
        rawError: e,
      }),
      { status: 400 },
    )
  }

  const { email, plan, metadata = {} } = body

  if (!email || !plan) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "payments",
        endpoint: "initialize",
        errorMessage: "Email and plan are required",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  try {
    // 3. Initialize transaction with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "payments",
          endpoint: "initialize",
          errorMessage: "Paystack secret key is not configured",
          timestamp: new Date(),
          requestId,
          userId,
        }),
        { status: 500 },
      )
    }

    // Add user_id to metadata
    const enhancedMetadata = {
      ...metadata,
      user_id: userId,
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        plan,
        metadata: enhancedMetadata,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscribe/success`,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "payments",
          endpoint: "initialize",
          errorMessage: data.message || "Failed to initialize payment",
          timestamp: new Date(),
          requestId,
          userId,
          rawError: data,
        }),
        { status: 400 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      createErrorResponse({
        apiName: "payments",
        endpoint: "initialize",
        errorMessage: "An error occurred while initializing payment",
        timestamp: new Date(),
        requestId,
        userId,
        rawError: error,
      }),
      { status: 500 },
    )
  }
}
