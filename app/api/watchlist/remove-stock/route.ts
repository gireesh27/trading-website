import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { watchlistId, symbol } = await req.json();

    if (!watchlistId || !symbol) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const updated = await Watchlist.findByIdAndUpdate(
      watchlistId,
      {
        $pull: { stocks: { symbol } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Watchlist not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("❌ Error removing stock from watchlist:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
