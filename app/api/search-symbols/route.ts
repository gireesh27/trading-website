import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("query");
    if (!query || query.length < 1) {
        return NextResponse.json({ results: [] });
    }

    try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
            query
        )}&quotesCount=10&newsCount=0&listsCount=0`;

        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!res.ok) {
            return NextResponse.json({ results: [] });
        }

        const data = await res.json();
        const quotes = data?.quotes ?? [];

        const results = quotes.map((q: any) => ({
            symbol: q.symbol ?? "",
            shortname: q.shortname ?? "",
            longname: q.longname ?? "",
            exchDisp: q.exchDisp ?? "",
            typeDisp: q.typeDisp ?? "",
        }));

        return NextResponse.json({ results });
    } catch (err) {
        console.error("search-symbols error:", err);
        return NextResponse.json({ results: [] });
    }
}
