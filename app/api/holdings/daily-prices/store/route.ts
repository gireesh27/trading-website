import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { stockApi } from "@/lib/api/stock-api";
import { cryptoApi } from "@/lib/api/crypto-api";

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
        let quote;

        if (sector === "crypto") {
          // Get crypto quote
          quote = await cryptoApi.getCryptoQuote(symbol);

          // Calculate previousClose using formula
          const previousClose = quote.changePercent
            ? quote.price / (1 + quote.changePercent / 100)
            : quote.price;

          // Set open price if missing
          const open = quote.price ?? previousClose;

          return DailyPrice.create({
            symbol: `${quote.symbol}-USD`,
            sector: sector || "crypto",
            date: now,
            close: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            high: quote.high ?? 0,
            low: quote.low ?? 0,
            open: open,
            previousClose: previousClose,
            volume: quote.volume ?? 0,
            marketCap: quote.marketCap ?? 0
          });
        } else {
          // Stock quote
          quote = await stockApi.getQuote(symbol);
          return DailyPrice.create({
            symbol,
            sector: sector || "Unknown",
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
        }
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
