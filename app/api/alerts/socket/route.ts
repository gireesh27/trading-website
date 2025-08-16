// app/api/alerts/socket/route.ts
import { NextRequest } from "next/server";
import { initIO } from "@/lib/socket";

export const runtime = "nodejs"; // ensure Node.js runtime, not Edge

let initialized = false;

export async function GET(req: NextRequest) {
  // @ts-ignore - App Router hack: use globalThis to persist server ref
  if (!(globalThis as any).httpServer) {
    (globalThis as any).httpServer = (req as any).request?.socket?.server;
  }

  const server = (globalThis as any).httpServer;

  if (!server) {
    return new Response("❌ Server not available", { status: 500 });
  }

  if (!initialized) {
    initIO(server);
    initialized = true;
    console.log("🚀 Socket.IO initialized in /api/alerts/socket");
  }

  return new Response("✅ Socket.IO server running", { status: 200 });
}
