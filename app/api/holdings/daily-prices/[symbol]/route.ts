// app/api/holdings/daily-prices/[symbol]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";

export async function GET(
  req: Request,
  context: { params: Promise<{ symbol: string }> }
) {
  await connectToDatabase();

  const { symbol } = await context.params; // ✅ await params
  const data = await DailyPrice.find({ symbol })
    .sort({ date: 1 })
    .lean();

  return NextResponse.json(data);
}
