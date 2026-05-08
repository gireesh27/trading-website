// /app/api/wallet/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/utils/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ -> paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json({ error: "Create order failed" }, { status: 500 });
  }
}
