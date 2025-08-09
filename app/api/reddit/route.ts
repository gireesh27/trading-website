import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const subreddit = searchParams.get("subreddit") || "algotrading";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    // Step 1: Get Reddit token
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

    // Step 2: Fetch posts
    const allPosts: any[] = [];
    let after: string | null = null;
    let fetchCount = 0;

    while (fetchCount < 5) {
      const res :any = await fetch(
        `https://oauth.reddit.com/r/${subreddit}/new?limit=100${
          after ? `&after=${after}` : ""
        }`,
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

    // Step 3: Format with image
    const formatted = allPosts.map((item) => {
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

    const start = (page - 1) * limit;
    const paginated = formatted.slice(start, start + limit);

    return NextResponse.json({
      posts: paginated,
      total: formatted.length,
      page,
      totalPages: Math.ceil(formatted.length / limit),
    });
  } catch (err) {
    console.error("Reddit API error", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
