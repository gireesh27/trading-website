import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Yahoo Finance API error (${response.status}):`, errorText);

      let parsedMessage = `External API returned an error for symbol '${symbol}'.`;

      try {
        const parsedError = JSON.parse(errorText);
        if (parsedError?.chart?.error?.description) {
          parsedMessage = parsedError.chart.error.description;
        }
      } catch (e) {
        console.warn("Failed to parse Yahoo error response as JSON.");
      }

      return NextResponse.json({ error: parsedMessage }, { status: response.status });
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]) {
      return NextResponse.json(
        { error: "Malformed data structure from Yahoo Finance." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API route internal error:", error);
    return NextResponse.json(
      {
        error:
          `Internal server error while fetching data: ${error.message || "Unknown error"}`
      },
      { status: 500 }
    );
  }
}
