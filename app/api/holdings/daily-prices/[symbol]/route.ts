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
      return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 });
    }

    // Normalize symbol for crypto (append -USD)
    symbol = symbol.toUpperCase();
    if (!symbol.endsWith("-USD")) {
      symbol = `${symbol}-USD`;
    }

    const cacheKey = `daily-prices:${symbol}`;

    // 1️⃣ Try cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    // 2️⃣ Query DB if no cache
    await connectToDatabase();
    const data = await DailyPrice.find({ symbol })
      .sort({ date: 1 })
      .lean();

    // 3️⃣ Cache the result with expiration
    await redis.set(cacheKey, JSON.stringify(data), { EX: CACHE_TTL });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Error fetching daily prices:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
