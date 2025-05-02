import { NextResponse } from "next/server"
import { generateRequestId, createErrorResponse } from "@/lib/error-monitoring"

export async function GET(request: Request) {
  const requestId = generateRequestId()
  console.log(`[${new Date().toISOString()}] Received GET /api/payments/plans - RequestID: ${requestId}`)

  try {
    // Fetch plans from Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "payments",
          endpoint: "plans",
          errorMessage: "Paystack secret key is not configured",
          timestamp: new Date(),
          requestId,
        }),
        { status: 500 },
      )
    }

    const response = await fetch("https://api.paystack.co/plan", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      return NextResponse.json(
        createErrorResponse({
          apiName: "payments",
          endpoint: "plans",
          errorMessage: data.message || "Failed to fetch plans",
          timestamp: new Date(),
          requestId,
          rawError: data,
        }),
        { status: 400 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json(
      createErrorResponse({
        apiName: "payments",
        endpoint: "plans",
        errorMessage: "An error occurred while fetching plans",
        timestamp: new Date(),
        requestId,
        rawError: error,
      }),
      { status: 500 },
    )
  }
}
