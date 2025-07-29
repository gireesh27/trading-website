import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    const user = isObjectId
      ? await User.findById(new mongoose.Types.ObjectId(userId))
      : await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Fetch user orders
    const orders = await Order.find({ userId: user._id });

    // 2. Calculate total investment and current value
    let totalInvestment = 0;
    let currentValue = 0;

    const grouped = new Map<string, { quantity: number; avgPrice: number }>();

    for (const order of orders) {
      if (order.type === "buy") {
        const existing = grouped.get(order.symbol) || { quantity: 0, avgPrice: 0 };
        const newQty = existing.quantity + order.quantity;
        const newAvg =
          (existing.avgPrice * existing.quantity + order.price * order.quantity) / newQty;
        grouped.set(order.symbol, { quantity: newQty, avgPrice: newAvg });
        totalInvestment += order.price * order.quantity;
      } else if (order.type === "sell") {
        const existing = grouped.get(order.symbol);
        if (existing) {
          existing.quantity -= order.quantity;
          grouped.set(order.symbol, existing);
        }
      }
    }

    // 3. Simulate current prices
    const prices = Object.fromEntries(
      Array.from(grouped.entries()).map(([symbol, data]) => [
        symbol,
        data.avgPrice * (1 + Math.random() * 0.1 - 0.05),
      ])
    );

    for (const [symbol, { quantity }] of grouped.entries()) {
      const currentPrice = prices[symbol] || 0;
      currentValue += currentPrice * quantity;
    }

    const profitLoss = currentValue - totalInvestment;

    const availableFunds = user.availableCash || 0;

    // 4. Simulated chart data
    const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    const chartData = chartLabels.map((_, i) => {
      return (
        totalInvestment +
        (profitLoss / chartLabels.length) * i +
        Math.random() * 500 - 250
      );
    });

    return NextResponse.json({
      totalValue: currentValue + availableFunds,
      availableFunds,
      profitLoss,
      chartLabels,
      chartData,
    });
  } catch (err: any) {
    console.error("Portfolio summary error:", err);
    return NextResponse.json(
      { error: "Server error", message: err.message },
      { status: 500 }
    );
  }
}
