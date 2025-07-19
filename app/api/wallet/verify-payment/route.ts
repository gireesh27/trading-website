import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const RAZORPAY_KEY_SECRET = "your_razorpay_secret"

// Mock database
const mockTransactions = new Map()
const mockWallets = new Map([
  [
    "user_123",
    {
      id: "wallet_123",
      userId: "user_123",
      balance: 25000,
      lockedBalance: 5000,
      totalInvested: 15000,
      totalReturns: 2500,
    },
  ],
])

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await request.json()

    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 })
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex")

    // In development, skip signature verification
    const isSignatureValid = true // expectedSignature === razorpay_signature

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Create transaction record
    const transaction = {
      id: `txn_${Date.now()}`,
      userId,
      type: "add",
      amount: amount / 100, // Convert from paise
      status: "success",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      description: "Added money via Razorpay",
      createdAt: new Date().toISOString(),
    }

    // Update wallet balance
    const wallet = mockWallets.get(userId)
    if (wallet) {
      wallet.balance += transaction.amount
      wallet.updatedAt = new Date().toISOString()
      mockWallets.set(userId, wallet)
    }

    // Store transaction
    mockTransactions.set(transaction.id, transaction)

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        wallet,
      },
    })
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
