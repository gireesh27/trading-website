import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { stockApi } from "@/lib/api/stock-api";
import { cryptoApi } from "@/lib/api/crypto-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const holdings = await Holding.find({ status: "open" });
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    let updatedCount = 0;

    // Divide holdings by sector
    const cryptoHoldings = holdings.filter(h => h.sector === "crypto");
    const stockHoldings = holdings.filter(h => h.sector !== "crypto");

    // Update crypto holdings
    const cryptoQuotes = await Promise.all(
      cryptoHoldings.map(h => cryptoApi.getCryptoQuote(h.symbol))
    );

    for (let i = 0; i < cryptoHoldings.length; i++) {
      const holding = cryptoHoldings[i];
      const quote = cryptoQuotes[i];

      // Calculate previousClose from price and percent change
      const previousClose = quote.changePercent
        ? quote.price / (1 + quote.changePercent / 100)
        : quote.price;

      // Use previousClose as open if open is missing
      const open = quote.price ?? previousClose;

      const lastEntry = holding.priceHistory?.at(-1);
      if (!lastEntry || new Date(lastEntry.date) < fiveMinutesAgo) {
        holding.priceHistory.push({
          symbol: `${quote.symbol}-USD`,
          sector: holding.sector,
          date: now,
          close: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          high: quote.high ?? 0,
          low: quote.low ?? 0,
          open: open,
          previousClose: previousClose,
          volume: quote.volume ?? 0,
          marketCap: quote.marketCap ?? 0,
        });
        await holding.save();
        updatedCount++;
      }
    }

    // Update stock holdings
    const stockQuotes = await Promise.all(
      stockHoldings.map(h => stockApi.getQuote(h.symbol))
    );

    for (let i = 0; i < stockHoldings.length; i++) {
      const holding = stockHoldings[i];
      const quote = stockQuotes[i];

      const lastEntry = holding.priceHistory?.at(-1);
      if (!lastEntry || new Date(lastEntry.date) < fiveMinutesAgo) {
        holding.priceHistory.push({
          symbol: holding.symbol,
          sector: holding.sector,
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
        await holding.save();
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      totalHoldings: holdings.length,
    });
  } catch (error: any) {
    console.error("Error updating holdings priceHistory:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
