import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@/lib/Database/Models/User";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  await connectToDatabase();

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json(
        { success: false, message: "Symbol is required" },
        { status: 400 }
      );
    }

    // Ensure the holding exists for this user
    const holding = await Holding.findOne({
      userId: user._id,
      symbol,
    });

    if (!holding) {
      return NextResponse.json(
        { success: false, message: "Holding not found" },
        { status: 404 }
      );
    }

    // Fetch price history from DailyPrice collection
    const history = await DailyPrice.find(
      { symbol },
      
      {
        date: 1,
        sector: 0,
        close: 1,
        open: 1,
        high: 1,
        low: 1,
        volume: 1,
        marketCap: 1,
        change: 1,
        changePercent: 1,
        previousClose: 1,
        _id: 0,
      }
    ).sort({ date: 1 });

    return NextResponse.json({
      success: true,
      symbol,
      priceHistory: history || [],
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
