// /app/api/trading/orderbook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";

// Group and aggregate orders by price level
function aggregateOrders(orders: any[], type: "buy" | "sell") {
  const grouped: Record<string, { price: number; quantity: number; total: number }> = {};

  for (const order of orders) {
    const key = order.price.toFixed(2); // Normalize price precision
    if (!grouped[key]) {
      grouped[key] = {
        price: order.price,
        quantity: 0,
        total: 0,
      };
    }
    grouped[key].quantity += order.quantity;
    grouped[key].total += order.quantity * order.price;
  }

  const result = Object.values(grouped);
  return result.sort((a, b) =>
    type === "buy" ? b.price - a.price : a.price - b.price
  );
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
    }

    const [buyOrders, sellOrders] = await Promise.all([
      Order.find({ symbol, type: "buy", status: { $in: ["pending"] } }),
      Order.find({ symbol, type: "sell", status: { $in: ["pending"] } }),
    ]);

    const bids = aggregateOrders(buyOrders, "buy");
    const asks = aggregateOrders(sellOrders, "sell");

    return NextResponse.json({ success: true, bids, asks });
  } catch (err: any) {
    console.error("OrderBook fetch error:", err);
    return NextResponse.json({ error: "Failed to load order book" }, { status: 500 });
  }
}