import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { Watchlist } from "@/lib/Database/Models/Watchlist";
import { User } from "@/lib/Database/Models/User";

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { id } = await req.json();
  await Watchlist.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}