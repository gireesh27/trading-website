// app/api/daily-prices/store/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { stockApi } from "@/lib/api/stock-api";

export async function POST() {
  await connectToDatabase();

  try {
    const symbols = await Holding.distinct("symbol", { status: "open" });

    if (!symbols.length) {
      return NextResponse.json({ success: false, message: "No symbols found in holdings" });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // normalize to day start UTC

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const quote = await stockApi.getQuote(symbol);

        return DailyPrice.updateOne(
          { symbol, date: today },
          { $set: { closePrice: quote.price } },
          { upsert: true }
        );
      })
    );

    return NextResponse.json({ success: true, updated: results.length, symbols });
  } catch (err: any) {
    console.error("Error storing daily prices", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
