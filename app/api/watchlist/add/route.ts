import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Watchlist as WatchlistModel } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";
import { normalizeWatchlists } from "@/lib/utils/watchlist"; // ✅ adjust path if needed

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { symbol, name, price, change, changePercent, watchlistId,sector } = body;

    // Validate required fields
    if (!symbol || !watchlistId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const watchlist = await WatchlistModel.findOne({ userId: user._id, _id: watchlistId });
    if (!watchlist) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    // Check for duplicate
    const exists = watchlist.stocks.find((item: any) => item.symbol === symbol);
    if (exists) {
      return NextResponse.json({ success: false, message: "Already exists in watchlist." }, { status: 409 });
    }

    // Add stock
    watchlist.stocks.push({
      symbol,
      sector,
      name: name || symbol,
      price: price ?? 0,
      change: change ?? 0,
      changePercent: changePercent ?? 0,
      addedAt: new Date(),
    });

    await watchlist.save();

    // Fetch fresh watchlist and normalize
    const updatedRaw = await WatchlistModel.findById(watchlist._id);
    const [updated] = normalizeWatchlists([updatedRaw]);

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("❌ Error adding to watchlist:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
