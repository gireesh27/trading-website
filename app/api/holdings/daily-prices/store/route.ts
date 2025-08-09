import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { stockApi } from "@/lib/api/stock-api";

export async function POST() {
  await connectToDatabase();

  try {
    // Get all open holdings with symbol & sector
    const holdings = await Holding.find(
      { status: "open" },
      { symbol: 1, sector: 1, _id: 0 }
    ).lean();

    if (!holdings.length) {
      return NextResponse.json({
        success: false,
        message: "No open symbols found in holdings"
      });
    }

    const now = new Date();

    // Insert a new price record per holding
    const results = await Promise.all(
      holdings.map(async ({ symbol, sector }) => {
        const quote = await stockApi.getQuote(symbol);

        return DailyPrice.create({
          symbol,
          sector: sector || "Unknown", // fallback
          date: now,
          close: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          high: quote.high,
          low: quote.low,
          open: quote.open,
          previousClose: quote.previousClose,
          volume: quote.volume,
          marketCap: quote.marketCap
        });
      })
    );

    return NextResponse.json({
      success: true,
      inserted: results.length,
      symbols: holdings.map(h => h.symbol)
    });
  } catch (err: any) {
    console.error("Error storing prices every 5 minutes", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

