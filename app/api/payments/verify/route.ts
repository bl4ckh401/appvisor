import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"

export async function POST(request: Request) {
  const requestId = generateRequestId()
  console.log(`[${new Date().toISOString()}] Received POST /api/payments/verify - RequestID: ${requestId}`)

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
        endpoint: "verify",
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
        endpoint: "verify",
        errorMessage: "Invalid request format: Malformed JSON",
        timestamp: new Date(),
        requestId,
        userId,
        rawError: e,
      }),
      { status: 400 },
    )
  }

  const { reference } = body

  if (!reference) {
    return NextResponse.json(
      createErrorResponse({
        apiName: "payments",
        endpoint: "verify",
        errorMessage: "Payment reference is required",
        timestamp: new Date(),
        requestId,
        userId,
      }),
      { status: 400 },
    )
  }

  try {
    // 3. Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "payments",
          endpoint: "verify",
          errorMessage: "Paystack secret key is not configured",
          timestamp: new Date(),
          requestId,
          userId,
        }),
        { status: 500 },
      )
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    })

    const verifyData = await verifyResponse.json()

    if (!verifyResponse.ok || !verifyData.status) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "payments",
          endpoint: "verify",
          errorMessage: "Payment verification failed",
          timestamp: new Date(),
          requestId,
          userId,
          rawError: verifyData,
        }),
        { status: 400 },
      )
    }

    // 4. Update user subscription in database
    if (verifyData.data.status === "success") {
      const metadata = verifyData.data.metadata || {}
      const planDetails = verifyData.data.plan || {}
      const planName = planDetails.name || ""
      const isAnnual = metadata.is_annual === true

      // Determine plan type from plan name
      const planType = planName.toLowerCase().includes("pro")
        ? "pro"
        : planName.toLowerCase().includes("team")
          ? "team"
          : "free"

      // Calculate expiration date (1 month or 1 year from now)
      const expiresAt = new Date()
      if (isAnnual) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      }

      // Update user subscription
      const { error: updateError } = await supabase.from("user_subscriptions").upsert({
        user_id: userId,
        plan: planType,
        status: "active",
        payment_reference: reference,
        expires_at: expiresAt.toISOString(),
        payment_data: verifyData.data,
        is_annual: isAnnual,
      })

      if (updateError) {
        console.error("Failed to update subscription:", updateError)
        return NextResponse.json(
          createErrorResponse({
            apiName: "payments",
            endpoint: "verify",
            errorMessage: "Payment verified but failed to update subscription",
            timestamp: new Date(),
            requestId,
            userId,
            rawError: updateError,
          }),
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          plan: planType,
          expiresAt: expiresAt.toISOString(),
          isAnnual: isAnnual,
        },
      })
    } else {
      return NextResponse.json(
        createErrorResponse({
          apiName: "payments",
          endpoint: "verify",
          errorMessage: `Payment failed with status: ${verifyData.data.status}`,
          timestamp: new Date(),
          requestId,
          userId,
          rawError: verifyData,
        }),
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      createErrorResponse({
        apiName: "payments",
        endpoint: "verify",
        errorMessage: "An error occurred while verifying payment",
        timestamp: new Date(),
        requestId,
        userId,
        rawError: error,
      }),
      { status: 500 },
    )
  }
}
