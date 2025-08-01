import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";
import bcrypt from "bcryptjs";

// GET: Fetch single order details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: "Order ID missing" }, { status: 400 });

  try {
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const user = await User.findOne({ email: session.user.email });
    if (!user || order.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("GET /orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: "Order ID missing" }, { status: 400 });

  try {
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const user = await User.findOne({ email: session.user.email });
    if (!user || order.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (["filled", "cancelled"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order already completed or cancelled" },
        { status: 400 }
      );
    }

    // Refund only pending buy orders
    if (order.type === "buy") {
      const refund = order.quantity * order.price + (order.feeBreakdown?.brokerage || 0) + (order.feeBreakdown?.convenience || 0);
      user.availableCash += refund;
      await user.save();
    }

    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({ success: true, message: "Order cancelled and amount refunded" });
  } catch (err: any) {
    console.error("DELETE /orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pin } = await req.json();
  const user = await User.findOne({ email: session.user.email });
  if (!user || !user.walletPin) return NextResponse.json({ error: "Wallet PIN not set" }, { status: 400 });

  const isMatch = await bcrypt.compare(pin, user.walletPin);
  if (!isMatch) return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });

  const order = await Order.findById(params.id);
  if (!order || order.status !== "pending") {
    return NextResponse.json({ error: "Order not found or already confirmed" }, { status: 404 });
  }

  const cost = order.quantity * order.price;
  const brokerage = order.feeBreakdown?.brokerage || 0;
  const convenience = order.feeBreakdown?.convenience || 0;
  const total = order.type === "buy" ? cost + brokerage + convenience : cost;

  if (order.type === "buy") {
    if (user.availableCash < total) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }
    user.availableCash -= total;
  } else {
    // Validate holdings again if needed
    user.availableCash += cost;
  }

  await user.save();

  order.status = "filled";
  order.updatedAt = new Date();
  order.filledQuantity = order.quantity;
  await order.save();

  return NextResponse.json({ success: true, message: "Order confirmed", walletBalance: user.availableCash });
}
