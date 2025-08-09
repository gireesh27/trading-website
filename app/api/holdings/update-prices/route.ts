import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { stockApi } from "@/lib/api/stock-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const holdings = await Holding.find({ status: "open" });

    let updatedCount = 0;
    const now = new Date();

    for (const holding of holdings) {
      const quote = await stockApi.getQuote(holding.symbol);

      // Check if last priceHistory entry is within 5 minutes
      const lastEntry = holding.priceHistory?.length
        ? holding.priceHistory[holding.priceHistory.length - 1]
        : null;

      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      if (!lastEntry || new Date(lastEntry.date) < fiveMinutesAgo) {
        holding.priceHistory.push({
          symbol: holding.symbol,
          date: now,
          close: quote.price,
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
