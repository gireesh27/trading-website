import { type NextRequest, NextResponse } from "next/server"

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
    const { amount, bankAccountId } = await request.json()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 401 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    const wallet = mockWallets.get(userId)
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    if (amount > wallet.balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Create withdrawal transaction
    const transaction = {
      id: `txn_${Date.now()}`,
      userId,
      type: "withdraw",
      amount,
      status: "pending",
      bankAccountId,
      description: "Withdrawal to bank account",
      createdAt: new Date().toISOString(),
    }

    // Update wallet balance
    wallet.balance -= amount
    wallet.updatedAt = new Date().toISOString()
    mockWallets.set(userId, wallet)

    // Store transaction
    mockTransactions.set(transaction.id, transaction)

    // In production, integrate with RazorpayX for payouts
    // Simulate processing delay
    setTimeout(() => {
      transaction.status = "success"
      mockTransactions.set(transaction.id, transaction)
    }, 5000)

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        wallet,
      },
    })
  } catch (error) {
    console.error("Withdraw money error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
