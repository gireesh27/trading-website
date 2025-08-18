import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const BROKERAGE_PERCENT = 0.005;
const CONVENIENCE_FEE = 20; 

// Place a new order
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const body = await req.json();
    const { symbol, quantity, price, type, orderType, sector } = body;

    if (!symbol || !quantity || !price || !type || !sector) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.walletBalance === undefined) user.walletBalance = 1000;

    const cost = quantity * price;
    const brokerage = cost * BROKERAGE_PERCENT;
    const total = type === "buy" ? cost + brokerage + CONVENIENCE_FEE : cost;

    if (type === "buy") {
      if (user.walletBalance < total) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }
      user.walletBalance -= total;
    } else if (type === "sell") {
      const buyOrders = await Order.aggregate([
        { $match: { userId: user._id, symbol, type: "buy", status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalBought: { $sum: "$quantity" } } },
      ]);

      const sellOrders = await Order.aggregate([
        { $match: { userId: user._id, symbol, type: "sell", status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalSold: { $sum: "$quantity" } } },
      ]);

      const totalBought = buyOrders[0]?.totalBought || 0;
      const totalSold = sellOrders[0]?.totalSold || 0;
      const availableToSell = totalBought - totalSold;

      if (availableToSell < quantity) {
        return NextResponse.json(
          { error: `Not enough holdings to sell ${symbol}` },
          { status: 400 }
        );
      }

      user.walletBalance += cost;
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
      feeBreakdown: {
        brokerage: type === "buy" ? brokerage : 0,
        convenience: type === "buy" ? CONVENIENCE_FEE : 0,
      },
    });

    await order.save();

    return NextResponse.json({ success: true, order, walletBalance: user.walletBalance });
  } catch (err: any) {
    console.error("POST /orders error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error("GET /api/trading/orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}