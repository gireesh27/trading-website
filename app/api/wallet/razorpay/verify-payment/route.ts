// /app/api/wallet/razorpay/verify-payment/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import Transaction from "@/lib/Database/Models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Step 1: Credit Wallet
    user.walletBalance += amount;
    await user.save();

    // ✅ Step 2: Log Transaction
    await Transaction.create({
      userId: user._id,
      type: "credit",
      amount: amount,
      source: "bank",
      status: "completed",
      orderId: razorpay_order_id,
      executedAt: new Date(),
      feeBreakdown: {
        convenience: 0,
        brokerage: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
