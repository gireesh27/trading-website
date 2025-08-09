import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const BROKERAGE_PERCENT = 0.005; // 0.5%
const CONVENIENCE_FEE = 20; // Flat fee

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 });
    }

    const body = JSON.parse(text);
    const { symbol, quantity, price, type, orderType,sector } = body;

    if (!symbol || !quantity || !price || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // ✅ Initialize wallet balance if new user or zero balance
    if (user.availableCash === undefined || user.availableCash === 0) {
      user.availableCash = 100000;
    }

    const cost = quantity * price;
    const brokerage = cost * BROKERAGE_PERCENT;
    const total = type === "buy" ? cost + brokerage + CONVENIENCE_FEE : cost;

    if (type === "buy") {
      if (user.availableCash < total) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }

      user.availableCash -= total;

    } else if (type === "sell") {
      const buyOrders = await Order.aggregate([
        { $match: { userId: user._id, symbol, type: "buy", status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalBought: { $sum: "$quantity" } } }
      ]);

      const sellOrders = await Order.aggregate([
        { $match: { userId: user._id, symbol, type: "sell", status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalSold: { $sum: "$quantity" } } }
      ]);

      const totalBought = buyOrders[0]?.totalBought || 0;
      const totalSold = sellOrders[0]?.totalSold || 0;
      const availableToSell = totalBought - totalSold;

      if (availableToSell < quantity) {
        return NextResponse.json({ error: `Not enough holdings to sell ${symbol}` }, { status: 400 });
      }

      // You can apply sell fees if desired
      user.availableCash += cost;
    }

    await user.save();

    const order = new Order({
      userId: user._id,
      symbol,
      sector,
      quantity,
      price,
      type,
      orderType,
      status: "pending",
      filledQuantity: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      feeBreakdown: {
        brokerage: type === "buy" ? brokerage : 0,
        convenience: type === "buy" ? CONVENIENCE_FEE : 0,
      },
    });

    await order.save();

    return NextResponse.json({ success: true, order, walletBalance: user.availableCash });
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
