// app/api/holdings/daily-prices/[symbol]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import redis from "@/lib/redis"; // <-- Import your Redis instance

const CACHE_TTL = 600; // 600 seconds = 10 minutes

export async function GET(
  req: Request,
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await context.params;

  // 1️⃣ Try cache first
  const cacheKey = `daily-prices:${symbol}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return NextResponse.json(JSON.parse(cachedData));
  }

  // 2️⃣ If not cached, query DB
  await connectToDatabase();
  const data = await DailyPrice.find({ symbol })
    .sort({ date: 1 })
    .lean();

  // 3️⃣ Store in cache
  await redis.set(cacheKey, JSON.stringify(data), "EX", CACHE_TTL);

  return NextResponse.json(data);
}
