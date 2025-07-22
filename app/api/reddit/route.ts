// app/api/reddit/route.ts
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const credentials = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString("base64");

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

    const redditRes = await axios.get(
      `https://oauth.reddit.com/r/algotrading/new?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": process.env.REDDIT_USER_AGENT || "nextjs-reddit-client",
        },
      }
    );

    const allPosts = redditRes.data.data.children.map((item: any) => ({
      id: item.data.id,
      title: item.data.title,
      author: item.data.author,
      url: item.data.url,
      selftext: item.data.selftext,
      created_utc: item.data.created_utc,
      permalink: `https://reddit.com${item.data.permalink}`,
    }));

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = allPosts.slice(start, end);

    return NextResponse.json({
      posts: paginatedPosts,
      total: allPosts.length,
      page,
      totalPages: Math.ceil(allPosts.length / limit),
    });
  } catch (err: any) {
    console.error("Reddit API Error:", err.response?.data || err.message);
    return NextResponse.json({ error: "Failed to fetch Reddit posts" }, { status: 500 });
  }
}
