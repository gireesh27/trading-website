import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { cryptoApi } from "@/lib/api/crypto-api"; // server-safe API calls

const CACHE_KEY = "crypto:quotes";
const CACHE_EXPIRE_SECONDS = 300; // 5 minutes

export async function GET(req: Request) {
  try {
    // Check cache
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Fetch fresh data
    const quotes = await cryptoApi.getMultipleCryptoQuotes();

    // Cache it with expiration
    await redis.set(CACHE_KEY, JSON.stringify(quotes), { EX: CACHE_EXPIRE_SECONDS });

    return NextResponse.json(quotes);
  } catch (err: any) {
    console.error("Crypto quotes API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
