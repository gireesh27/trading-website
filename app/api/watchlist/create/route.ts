import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";
import { normalizeWatchlists } from "@/lib/utils/watchlist"; // Make sure the path is correct

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newWatchlist = await Watchlist.create({
      userId: user._id,
      name: name.trim(),
      stocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [normalized] = normalizeWatchlists([newWatchlist]);

    return NextResponse.json({ success: true, watchlist: normalized });
  } catch (err: any) {
    console.error("❌ Error creating watchlist:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
