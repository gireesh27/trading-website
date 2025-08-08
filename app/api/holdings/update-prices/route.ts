import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { stockApi } from "@/lib/api/stock-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const holdings = await Holding.find({});
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight

    let updatedCount = 0;

    for (const holding of holdings) {
      const quote = await stockApi.getQuote(holding.symbol);

      const alreadyExists = holding.priceHistory?.some(
        (p: { date: Date }) =>
          p.date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
      );

      if (!alreadyExists) {
        holding.priceHistory.push({
          symbol: holding.symbol,
          date: today,
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
    console.error("Error updating holdings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
