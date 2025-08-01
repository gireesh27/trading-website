import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const orders = await Order.find({ userId, status: "filled" }).sort({ createdAt: 1 });

  const holdings: Record<
    string,
    {
      symbol: string;
      quantity: number;
      avgBuyPrice: number;
      totalCost: number;
      totalSellValue: number;
      profitOrLoss: number;
      buyDate: string;
      sellDate?: string;
      holdingPeriod: number;
    }
  > = {};

  for (const order of orders) {
    const { symbol, type, quantity, price, createdAt } = order;

    if (!holdings[symbol]) {
      holdings[symbol] = {
        symbol,
        quantity: 0,
        avgBuyPrice: 0,
        totalCost: 0,
        totalSellValue: 0,
        profitOrLoss: 0,
        buyDate: createdAt,
        holdingPeriod: 0,
      };
    }

    const h = holdings[symbol];

    if (type === "buy") {
      h.totalCost += quantity * price;
      h.quantity += quantity;
      h.avgBuyPrice = h.totalCost / h.quantity;
      h.buyDate = h.buyDate || createdAt;
    }

    if (type === "sell") {
      h.totalSellValue += quantity * price;
      h.quantity -= quantity;
      h.sellDate = createdAt;
    }

    if (h.sellDate) {
      const buy = new Date(h.buyDate);
      const sell = new Date(h.sellDate);
      h.holdingPeriod = Math.floor((sell.getTime() - buy.getTime()) / (1000 * 60 * 60 * 24));
      h.profitOrLoss = h.totalSellValue - h.totalCost;
    }
  }

  return NextResponse.json({ success: true, holdings: Object.values(holdings) });
}
