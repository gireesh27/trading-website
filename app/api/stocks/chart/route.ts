import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { stockApi } from "@/lib/api/stock-api"; // must be server-safe

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const range = searchParams.get("range");
    const interval = searchParams.get("interval");

    if (!symbol || !range || !interval) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const cacheKey = `chart:${symbol}:${range}:${interval}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const data = await stockApi.getFullChartData(symbol, range, interval);

    // Cache for 20 minutes (1200 seconds)
    await redis.set(cacheKey, JSON.stringify(data), { EX: 1200 });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Chart API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
