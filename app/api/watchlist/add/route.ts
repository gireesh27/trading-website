import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { symbol, name, price, change, changePercent, watchlistId } = body;

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let watchlist = await Watchlist.findOne({ userId: user._id, _id: watchlistId });
  if (!watchlist) return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });

  const exists = watchlist.stocks.find((item: any) => item.symbol === symbol);
  if (exists) {
    return NextResponse.json({ message: "Already exists in watchlist." }, { status: 409 });
  }

  watchlist.stocks.push({
    symbol,
    name,
    price,
    change,
    changePercent,
    addedAt: new Date(),
  });

  await watchlist.save();

  return NextResponse.json({ success: true });
}
