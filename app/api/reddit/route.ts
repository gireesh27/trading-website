import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const subreddit = searchParams.get("subreddit") || "algotrading";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const cacheKey = `reddit:${subreddit}`;
  try {
    // Check cache first
    const cached = await redis.get(cacheKey);
    let allPosts;

    if (cached) {
      allPosts = JSON.parse(cached);
    } else {
      const credentials = Buffer.from(
        `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
      ).toString("base64");

      // Get token
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

      // Fetch posts - multiple pages for up to 500 posts max
      allPosts = [];
      let after: string | null = null;
      let fetchCount = 0;

      while (fetchCount < 5) {
        const res :any = await fetch(
          `https://oauth.reddit.com/r/${subreddit}/new?limit=100${after ? `&after=${after}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "User-Agent": process.env.REDDIT_USER_AGENT || "nextjs-reddit-client",
            },
          }
        );
        const json = await res.json();
        const posts = json.data.children;
        allPosts.push(...posts);
        after = json.data.after;
        if (!after) break;
        fetchCount++;
      }

      allPosts = allPosts.map((item) => {
        const data = item.data;
        let imageUrl = null;
        if (data.preview?.images?.[0]?.source?.url) {
          imageUrl = data.preview.images[0].source.url.replace(/&amp;/g, "&");
        } else if (/\.(jpg|jpeg|png|gif)$/i.test(data.url)) {
          imageUrl = data.url;
        }
        return {
          id: data.id,
          title: data.title,
          author: data.author,
          url: data.url,
          image: imageUrl,
          selftext: data.selftext,
          created_utc: data.created_utc,
          permalink: `https://reddit.com${data.permalink}`,
        };
      });

      // Cache for 10minutes
      await redis.set(cacheKey, JSON.stringify(allPosts), "EX", 600);
    }

    // Paginate
    const start = (page - 1) * limit;
    const paginated = allPosts.slice(start, start + limit);

    return NextResponse.json({
      posts: paginated,
      total: allPosts.length,
      page,
      totalPages: Math.ceil(allPosts.length / limit),
    });
  } catch (err) {
    console.error("Reddit API error", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
