import { NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(); // configure your redis connection here

const CACHE_DURATION_SECONDS = 60; // cache duration per query

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "trading";
  const CACHE_KEY = `tweets:${query}`;

  // Try cache first
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return NextResponse.json({ tweets: JSON.parse(cached) });
  }

  const BEARER_TOKEN = process.env.X_BEARER_TOKEN;
  if (!BEARER_TOKEN) {
    return NextResponse.json(
      { error: "Missing Bearer token in env" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(
        query
      )}&max_results=100&tweet.fields=created_at,author_id`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const tweets = data.data || [];

    // Cache the response
    await redis.setex(CACHE_KEY, CACHE_DURATION_SECONDS, JSON.stringify(tweets));

    return NextResponse.json({ tweets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
