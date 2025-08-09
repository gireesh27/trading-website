import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { stockApi } from "@/lib/api/stock-api";

export async function POST() {
  await connectToDatabase();

  try {
    // Get all distinct open symbols from holdings
    const symbols = await Holding.distinct("symbol", { status: "open" });

    if (!symbols.length) {
      return NextResponse.json({ success: false, message: "No open symbols found in holdings" });
    }

    const now = new Date();

    // Insert a new price record per symbol with full timestamp
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const quote = await stockApi.getQuote(symbol);

        // Insert new DailyPrice doc
        return DailyPrice.create({
          symbol,
          date: now,
          close: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          high: quote.high,
          low: quote.low,
          open: quote.open,
          previousClose: quote.previousClose,
          volume: quote.volume,
          marketCap: quote.marketCap,
        });
      })
    );

    return NextResponse.json({ success: true, inserted: results.length, symbols });
  } catch (err: any) {
    console.error("Error storing prices every 5 minutes", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
