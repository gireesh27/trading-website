import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: NextRequest) {
  await connectDB();
  const { watchlistId, symbol } = await req.json();
  const updated = await Watchlist.findByIdAndUpdate(
    watchlistId,
    {
      $pull: { stocks: { symbol } },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  );
  return NextResponse.json({ success: true, updated });
}