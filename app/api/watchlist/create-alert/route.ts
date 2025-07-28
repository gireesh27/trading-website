import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { watchlistId, symbol, alert } = await req.json();

    if (!watchlistId || !symbol || !alert) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await Watchlist.findOneAndUpdate(
      { _id: watchlistId, "stocks.symbol": symbol },
      {
        $push: { "stocks.$.alerts": alert },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Stock or watchlist not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("❌ Error adding alert:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
