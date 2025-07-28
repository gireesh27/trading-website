import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { symbol } = await req.json();
  const user = await User.findOne({ email: session.user.email });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let watchlist = await Watchlist.findOne({ userId: user._id });
  if (!watchlist) {
    watchlist = new Watchlist({ userId: user._id, stocks: [symbol] });
  } else if (!watchlist.stocks.includes(symbol)) {
    watchlist.stocks.push(symbol);
  }

  await watchlist.save();
  return NextResponse.json({ success: true, watchlist });
}
