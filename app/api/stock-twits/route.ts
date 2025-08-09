import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.stocktwits.com/api/2/streams/trending.json");
    if (!res.ok) throw new Error("Failed to fetch trending messages");
    const data = await res.json();

    return NextResponse.json({ messages: data.messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
