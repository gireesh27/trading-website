import { type NextRequest, NextResponse } from "next/server"

// Mock Razorpay configuration
const RAZORPAY_KEY_ID = "rzp_test_1234567890"
const RAZORPAY_KEY_SECRET = "your_razorpay_secret"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR" } = await request.json()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    // Create Razorpay order
    const orderId = `order_${Date.now()}`
    const orderAmount = amount * 100 // Convert to paise

    // In production, use actual Razorpay SDK
    const order = {
      id: orderId,
      amount: orderAmount,
      currency,
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
    }

    // Store order in database (mock)
    // In production, save to PostgreSQL
    console.log("Created order:", order)

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: RAZORPAY_KEY_ID,
      },
    })
  } catch (error) {
    console.error("Add money error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
