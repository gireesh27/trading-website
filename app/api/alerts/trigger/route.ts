// app/api/alerts/trigger/route.ts
import { NextResponse } from "next/server";
import { getIO } from "@/lib/socket";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const io = getIO();

    if (io) {
      io.emit("newAlert", body); // broadcast to all clients
      console.log("📢 Alert triggered:", body);
    } else {
      console.log("⚠️ No active Socket.IO instance");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error in trigger:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
