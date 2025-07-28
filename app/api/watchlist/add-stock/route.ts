import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { watchlistId, stock } = await req.json();
  const updated = await Watchlist.findByIdAndUpdate(
    watchlistId,
    { $push: { stocks: stock }, $set: { updatedAt: new Date() } },
    { new: true }
  );
  return NextResponse.json({ success: true, updated });
}