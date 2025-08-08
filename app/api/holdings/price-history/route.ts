import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { Holding } from "@/lib/Database/Models/Holding";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    let userId = searchParams.get("userId"); // optional

    if (!symbol) {
      return NextResponse.json(
        { success: false, message: "Symbol is required" },
        { status: 400 }
      );
    }

    const query: any = { symbol };

    if (userId) {
      // Validate userId is a valid ObjectId string
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId" },
          { status: 400 }
        );
      }
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    const holding = await Holding.findOne(query);

    if (!holding) {
      return NextResponse.json(
        { success: false, message: "Holding not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      symbol,
      priceHistory: holding.priceHistory || [],
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
