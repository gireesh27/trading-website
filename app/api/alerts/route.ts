import { connectToDatabase } from "@/lib/Database/mongodb";
import Alert  from "@/lib/Database/Models/Alert";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { userId, symbol, type, value, condition } = body;

    if (!userId || !symbol || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type !== "news" && (value == null || !condition)) {
      return NextResponse.json({ error: "Price/Volume/Change alerts must include value and condition" }, { status: 400 });
    }

    const alert = await Alert.create({
      userId: userId.toString(), // ✅ Ensure it's stored as a string
      symbol: symbol.toUpperCase(),
      type,
      value: type === "news" ? undefined : value,
      condition: type === "news" ? undefined : condition,
    });

    return NextResponse.json({ success: true, data: alert }, { status: 201 });
  } catch (err: any) {
    console.error("❌ Alert creation error:", err);
    return NextResponse.json({ error: "Server error", message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId in query" }, { status: 400 });
    }

    const alerts = await Alert.find({ userId: userId.toString() }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: alerts });
  } catch (err: any) {
    console.error("❌ Alert fetch error:", err);
    return NextResponse.json({ error: "Server error", message: err.message }, { status: 500 });
  }
}
