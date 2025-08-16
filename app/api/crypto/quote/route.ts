import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { cryptoApi } from "@/lib/api/crypto-api"; // server-safe API calls

const CACHE_KEY = "crypto:quote";
const CACHE_EXPIRE_SECONDS = 300; // 5 minutes

export async function GET(req: Request) {
    try {
        // Check cache
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get("symbol");

        const cached = await redis.get(CACHE_KEY);
        if (cached) {
            return NextResponse.json(JSON.parse(cached));
        }

        // Fetch fresh data
        const quotes = await cryptoApi.getCryptoQuote(symbol as string);

        // Cache it with expiration
        await redis.set(CACHE_KEY, JSON.stringify(quotes), { EX: CACHE_EXPIRE_SECONDS });

        return NextResponse.json(quotes);
    } catch (err: any) {
        console.error("Crypto quote API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
