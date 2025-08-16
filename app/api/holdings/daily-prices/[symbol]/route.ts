import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { DailyPrice } from "@/lib/Database/Models/DailyPrice";
import redis from "@/lib/redis";

const CACHE_TTL = 600; // 10 minutes

export async function GET(
  req: Request,
  context: { params: { symbol: string } }
) {
 const { symbol } = await context.params;

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

  return NextResponse.json(data);
}
