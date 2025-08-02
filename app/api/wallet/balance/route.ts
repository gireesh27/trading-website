// app/api/wallet/balance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import {connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import {User} from "@/lib/Database/Models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ walletBalance: user.walletBalance || 0 }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
