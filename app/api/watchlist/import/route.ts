import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { watchlist } = await req.json();

    if (!watchlist || !watchlist.name || !Array.isArray(watchlist.items)) {
      return NextResponse.json({ success: false, message: "Invalid watchlist format" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const imported = await Watchlist.create({
      userId: user._id,
      name: watchlist.name,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      stocks: watchlist.items.map((item: any) => ({
        symbol: item.symbol,
        sector: item.sector,
        name: item.name || "",
        price: item.price ?? 0,
        change: item.change ?? 0,
        changePercent: item.changePercent ?? 0,
        addedAt: new Date(item.addedAt || Date.now()),
        alerts: item.alerts || [],
      })),
    });

    return NextResponse.json({ success: true, imported });
  } catch (err: any) {
    console.error("❌ Import watchlist error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
