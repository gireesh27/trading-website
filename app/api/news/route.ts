import { type NextRequest, NextResponse } from "next/server"

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "general"

    const response = await fetch(`https://finnhub.io/api/v1/news?category=${category}&token=${NEWS_API_KEY}`)

    const data = await response.json()

    const formattedNews = data.slice(0, 20).map((item: any, index: number) => ({
      id: item.id?.toString() || index.toString(),
      title: item.headline,
      summary: item.summary,
      source: item.source,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      category: item.category || "General",
      url: item.url,
      image: item.image,
    }))

    return NextResponse.json(formattedNews)
  } catch (error) {
    console.error("News API Error:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
