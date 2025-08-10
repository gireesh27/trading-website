import { type NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis"; // make sure you have this set up
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

const CACHE_TTL = 60; // seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "general";
    const cacheKey = `news:${category}`;

    // 1️⃣ Try fetching from Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Serving ${category} news from Redis cache`);
      return NextResponse.json(JSON.parse(cached));
    }

    // 2️⃣ Fetch from Finnhub if not in cache
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=${category}&token=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Finnhub API Error: ${response.statusText}`);
    }

    const data = await response.json();

    const formattedNews = data.map((item: any, index: number) => ({
      id: item.id?.toString() || index.toString(),
      title: item.headline,
      summary: item.summary,
      source: item.source,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      category: item.category || "General",
      url: item.url,
      image: item.image,
    }));

    // 3️⃣ Store in Redis cache
    await redis.set(cacheKey, JSON.stringify(formattedNews), "EX", CACHE_TTL);

    console.log(`Fetched fresh ${category} news & cached for ${CACHE_TTL}s`);
    return NextResponse.json(formattedNews);

  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
