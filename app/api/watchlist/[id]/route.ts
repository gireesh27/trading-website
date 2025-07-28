import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Watchlist as WatchlistModel } from "@/lib/Database/Models/Watchlist";
import { normalizeWatchlists } from "@/lib/utils/watchlist"; // adjust path if needed
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid watchlist ID" }, { status: 400 });
    }

    const watchlist = await WatchlistModel.findById(params.id);
    if (!watchlist) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    const [normalized] = normalizeWatchlists([watchlist]);

    return NextResponse.json({ success: true, watchlist: normalized });
  } catch (err: any) {
    console.error("GET watchlist error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid watchlist ID" }, { status: 400 });
    }

    const deleted = await WatchlistModel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Watchlist deleted" });
  } catch (err: any) {
    console.error("DELETE watchlist error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
