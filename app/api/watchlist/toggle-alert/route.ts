import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { watchlistId, symbol, alertId, isActive, triggeredAt } = await req.json();

    if (!watchlistId || !symbol || !alertId) {
      return NextResponse.json(
        { success: false, message: "watchlistId, symbol, and alertId are required" },
        { status: 400 }
      );
    }

    const updated = await Watchlist.findOneAndUpdate(
      { _id: watchlistId, "stocks.symbol": symbol },
      {
        $set: {
          "stocks.$[stock].alerts.$[alert].isActive": Boolean(isActive),
          "stocks.$[stock].alerts.$[alert].toggledAt": triggeredAt ?? new Date(),
        },
      },
      {
        arrayFilters: [{ "stock.symbol": symbol }, { "alert.id": alertId }],
        new: true,
      }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Watchlist or alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("Toggle alert error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
