import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";
import { normalizeWatchlists } from "@/lib/utils/watchlist"; // optional mapper

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const lists = await Watchlist.find({ userId: user._id }).sort({ updatedAt: -1 });

    // Optional: Normalize ObjectId and dates before sending to frontend
    const normalized = normalizeWatchlists(lists); // or send `lists` directly

    return NextResponse.json({ success: true, watchlists: normalized });
  } catch (err: any) {
    console.error("❌ Error in get-all:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
