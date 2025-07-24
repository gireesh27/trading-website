import { type NextRequest, NextResponse } from "next/server"

// Your actual API keys
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const source = searchParams.get("source") || "alphavantage"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter required" }, { status: 400 })
    }

    if (source === "finnhub") {
      // Fetch from Finnhub
      const [quoteResponse, profileResponse] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
      ])

      const quote = await quoteResponse.json()
      const profile = await profileResponse.json()

      if (quote.c) {
        return NextResponse.json({
          symbol: symbol,
          name: profile.name || symbol,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          volume: 0,
          high: quote.h,
          low: quote.l,
          open: quote.o,
          previousClose: quote.pc,
        })
      }
    } else {
      // Fetch from Alpha Vantage
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      )

      const data = await response.json()

      if (data["Global Quote"]) {
        const quote = data["Global Quote"]
        return NextResponse.json({
          symbol: quote["01. symbol"],
          price: Number.parseFloat(quote["05. price"]),
          change: Number.parseFloat(quote["09. change"]),
          changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
          volume: Number.parseInt(quote["06. volume"]),
          high: Number.parseFloat(quote["03. high"]),
          low: Number.parseFloat(quote["04. low"]),
          open: Number.parseFloat(quote["02. open"]),
          previousClose: Number.parseFloat(quote["08. previous close"]),
        })
      }
    }

    return NextResponse.json({ error: "No data found for symbol" }, { status: 404 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
