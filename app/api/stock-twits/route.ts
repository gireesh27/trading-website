import { NextResponse } from "next/server";
import redis from "@/lib/redis"; // your official redis client

const CACHE_KEY = "stocktwits_trending";
const CACHE_TTL = 600; // 10 minutes

export async function GET() {
  try {
    // 1. Check cache
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ messages: JSON.parse(cachedData) });
    }

    // 2. Fetch from API if not in cache
    const res = await fetch("https://api.stocktwits.com/api/2/streams/trending.json");
    if (!res.ok) throw new Error("Failed to fetch trending messages");

    const data = await res.json();

    // 3. Store in Redis cache
    await redis.set(CACHE_KEY, JSON.stringify(data.messages), { EX: CACHE_TTL });

    return NextResponse.json({ messages: data.messages });
  } catch (error: any) {
    console.error("Stocktwits API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
