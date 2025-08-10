import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis"; // your redis client instance using official 'redis'

const CACHE_DURATION_SECONDS = 600; // 10 minutes cache

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const subreddit = searchParams.get("subreddit") || "algotrading";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const cacheKey = `reddit:${subreddit}:page:${page}:limit:${limit}`;

  try {
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { headers: { "X-Cache": "HIT" } });
    }
  } catch (redisError) {
    console.error("Redis error (get):", redisError);
    // Continue without cache
  }

  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    // Get access token
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": process.env.REDDIT_USER_AGENT || "nextjs-reddit-client",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch posts from subreddit (limit up to 100 per request)
    const res = await fetch(
      `https://oauth.reddit.com/r/${subreddit}/new?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": process.env.REDDIT_USER_AGENT || "nextjs-reddit-client",
        },
      }
    );
    const json = await res.json();

    // Filter only posts with images
    const imagePosts = json.data.children
      .map((item: any) => {
        const data = item.data;
        let imageUrl = null;
        if (data.preview?.images?.[0]?.source?.url) {
          imageUrl = data.preview.images[0].source.url.replace(/&amp;/g, "&");
        } else if (/\.(jpg|jpeg|png|gif)$/i.test(data.url)) {
          imageUrl = data.url;
        }

        if (!imageUrl) return null;

        return {
          id: data.id,
          title: data.title,
          author: data.author,
          url: data.url,
          image: imageUrl,
          ups: data.ups,
          selftext: data.selftext,
          created_utc: data.created_utc,
          permalink: `https://reddit.com${data.permalink}`,
        };
      })
      .filter(Boolean);

    // Paginate results
    const start = (page - 1) * limit;
    const paginated = imagePosts.slice(start, start + limit);

    const responsePayload = {
      posts: paginated,
      total: imagePosts.length,
      page,
      totalPages: Math.ceil(imagePosts.length / limit),
    };

    // Cache the response with expiration using redis client 'set' with EX option
    try {
      await redis.set(cacheKey, JSON.stringify(responsePayload), { EX: CACHE_DURATION_SECONDS });
    } catch (redisError) {
      console.error("Redis error (set):", redisError);
    }

    return NextResponse.json(responsePayload, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    console.error("Reddit API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Reddit posts" },
      { status: 500 }
    );
  }
}
