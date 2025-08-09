import { NextResponse } from "next/server";

let cachedTweets: null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 1000; // 1 minute cache

export async function GET() {
  const now = Date.now();

  if (cachedTweets && now - cacheTimestamp < CACHE_DURATION_MS) {
    // Return cached data if still valid
    return NextResponse.json({ tweets: cachedTweets });
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
      "https://api.twitter.com/2/tweets/search/recent?query=trading&max_results=10&tweet.fields=created_at,author_id",
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
    cachedTweets = data.data;
    cacheTimestamp = now;

    return NextResponse.json({ tweets: cachedTweets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
