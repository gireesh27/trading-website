import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Alert checks should be triggered by a configured background worker or cron job.",
    triggeredCount: 0,
  });
}
