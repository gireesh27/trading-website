import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";

export async function POST(req: NextRequest) {
  await connectDB();
  const { watchlistId, symbol, alertId } = await req.json();
  const updated = await Watchlist.findOneAndUpdate(
    { _id: watchlistId },
    {
      $pull: { "stocks.$[stock].alerts": { id: alertId } },
      $set: { updatedAt: new Date() },
    },
    {
      new: true,
      arrayFilters: [{ "stock.symbol": symbol }],
    }
  );
  return NextResponse.json({ success: true, updated });
}