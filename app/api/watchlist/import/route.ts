import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { watchlist } = await req.json();
  const user = await User.findOne({ email: session?.user?.email });
  const imported = await Watchlist.create({ ...watchlist, userId: user._id });
  return NextResponse.json({ success: true, imported });
}