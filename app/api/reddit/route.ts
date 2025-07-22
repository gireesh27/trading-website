import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    // Step 1: Get access token
    const tokenRes = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": process.env.REDDIT_USER_AGENT || "nextjs-reddit-client",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 2: Fetch posts using Reddit's pagination (after param)
    const allPosts: any[] = [];
    let after: string | null = null;
    let fetchCount = 0;

    while (fetchCount < 5) {
      const redditRes: any = await axios.get(
        `https://oauth.reddit.com/r/algotrading/new?limit=100${after ? `&after=${after}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": process.env.REDDIT_USER_AGENT || "nextjs-reddit-client",
          },
        }
      );

      const posts = redditRes.data.data.children;
      allPosts.push(...posts);
      after = redditRes.data.data.after;

      if (!after) break; // no more posts
      fetchCount++;
    }

    const formattedPosts = allPosts.map((item: any) => ({
      id: item.data.id,
      title: item.data.title,
      author: item.data.author,
      url: item.data.url,
      selftext: item.data.selftext,
      created_utc: item.data.created_utc,
      permalink: `https://reddit.com${item.data.permalink}`,
    }));

    const start = (page - 1) * limit;
    const paginatedPosts = formattedPosts.slice(start, start + limit);

    return NextResponse.json({
      posts: paginatedPosts,
      total: formattedPosts.length,
      page,
      totalPages: Math.ceil(formattedPosts.length / limit),
    });
  } catch (err: any) {
    console.error("Reddit API Error:", err.response?.data || err.message);
    return NextResponse.json({ error: "Failed to fetch Reddit posts" }, { status: 500 });
  }
}
