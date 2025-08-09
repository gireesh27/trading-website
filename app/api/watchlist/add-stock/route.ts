import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Watchlist as WatchlistModel } from "@/lib/Database/Models/Watchlist";
import mongoose from "mongoose";
import { normalizeWatchlists } from "@/lib/utils/watchlist"; // adjust path if needed

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { watchlistId, symbol, name, price, change, changePercent,sector } = await req.json();

    if (
      !watchlistId ||
      !symbol ||
      typeof symbol !== "string"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(watchlistId)) {
      return NextResponse.json({ error: "Invalid watchlist ID" }, { status: 400 });
    }

    const watchlist = await WatchlistModel.findById(watchlistId);
    if (!watchlist) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    // Optional: prevent duplicate symbols
    const alreadyExists = watchlist.stocks.some(
      (s: { symbol: string; }) => s.symbol.toUpperCase() === symbol.toUpperCase()
    );
    if (alreadyExists) {
      return NextResponse.json({ success: false, message: "Stock already in watchlist" }, { status: 409 });
    }

    const stock = {
      symbol: symbol.toUpperCase(),
      sector,
      name: name ?? symbol,
      price,
      change,
      changePercent,
      addedAt: new Date(),
    };

    watchlist.stocks.push(stock);
    watchlist.updatedAt = new Date();
    const saved = await watchlist.save();

    const [normalized] = normalizeWatchlists([saved]);
    return NextResponse.json({ success: true, updated: normalized });
  } catch (err: any) {
    console.error("❌ POST /watchlist/add error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
