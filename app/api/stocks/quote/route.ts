import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { stockApi } from "@/lib/api/stock-api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  const cacheKey = `quote:${symbol.toUpperCase()}`;

  try {
    // Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Fetch fresh quote data
    const quote = await stockApi.getQuote(symbol);

    // Cache for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(quote), {
      EX: 300,
    });

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error("Quote API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
