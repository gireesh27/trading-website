import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Create a new order
export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { symbol, quantity, price, type, orderType } = body;

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const totalCost = quantity * (price || 0);

    if (type === "buy") {
      if (user.availableCash < totalCost) {
        return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
      }
      user.availableCash -= totalCost;
    } else {
      // For selling, implement holdings check if needed
      user.availableCash += totalCost;
    }

    await user.save();

    const order = new Order({
      userId: user._id,
      symbol,
      quantity,
      price,
      type,
      orderType,
      status: "pending",
      filledQuantity: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("POST /orders error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

// Get all orders for logged-in user
export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error("GET /orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
