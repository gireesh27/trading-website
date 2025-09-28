import { NextResponse } from "next/server"; 
import { connectToDatabase } from "@/lib/Database/mongodb";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import redis from "@/lib/redis";

const CACHE_TTL = 600; // 10 minutes

export async function GET(
  req: Request,
  context: { params: { symbol: string } }
) {
  try {
    let { symbol } = context.params;
    if (!symbol) {
      return NextResponse.json([], { status: 400 });
    }

    // Normalize symbol
    symbol = symbol.toUpperCase();
    if (!symbol.endsWith("-USD")) {
      symbol = `${symbol}-USD`;
    }

    const cacheKey = `daily-prices:${symbol}`;

    // Try cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Query DB
    await connectToDatabase();
    const data = await DailyPrice.find({ symbol }).sort({ date: 1 }).lean();

    // Cache result
    await redis.set(cacheKey, JSON.stringify(data), { EX: CACHE_TTL });

    // Always return array
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("Error fetching daily prices:", err);
    return NextResponse.json([], { status: 500 });
  }
}

