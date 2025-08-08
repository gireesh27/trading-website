import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import {Holding} from "@/lib/Database/Models/Holding"
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { success: false, message: "Symbol is required" },
        { status: 400 }
      );
    }

    const holding = await Holding.findOne({ symbol });

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
