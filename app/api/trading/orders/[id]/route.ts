import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";

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

// DELETE: Cancel order
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

    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({ success: true, message: "Order cancelled successfully" });
  } catch (err: any) {
    console.error("DELETE /orders/[id] error:", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
