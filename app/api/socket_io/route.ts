// app/api/socket_io/route.ts
import { NextRequest } from "next/server";
import { initIO } from "@/lib/socket";
import { connectToDatabase } from "@/lib/Database/mongodb";
import Alert from "@/lib/Database/Models/Alert";
import { stockApi } from "@/lib/api/stock-api";
import { Server as HTTPServer } from "http";

let initialized = false;

export async function GET(req: NextRequest) {
  await connectToDatabase();

  // ✅ Use global fallback for server instance
  // @ts-ignore
  const server: HTTPServer | undefined =
    (req as any)?.socket?.server || (globalThis as any).httpServer;

  if (!server) {
    console.error("❌ No HTTP server found");
    return new Response("Server not available", { status: 500 });
  }

  if (!initialized) {
    console.log("🔌 Initializing Socket.IO...");

    const io =
      (globalThis as any).io || initIO(server);

    (globalThis as any).io = io;
    (globalThis as any).httpServer = server;

    io.on("connection", (socket: any) => {
      console.log("✅ Client connected:", socket.id);

      socket.on("subscribe", (userId: string) => {
        console.log(`📌 User ${userId} subscribed`);
        socket.join(userId);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    // 🔄 background loop only once globally
    if (!(globalThis as any).alertChecker) {
      (globalThis as any).alertChecker = setInterval(async () => {
        try {
          const activeAlerts = await Alert.find({ status: "active" });

          for (const alert of activeAlerts) {
            try {
              const priceData = await stockApi.getQuote(alert.symbol);
              const currentPrice = priceData.price;

              const shouldTrigger =
                (alert.direction === "above" &&
                  currentPrice >= alert.targetPrice) ||
                (alert.direction === "below" &&
                  currentPrice <= alert.targetPrice);

              if (shouldTrigger) {
                io.to(alert.userId.toString()).emit("alert", {
                  symbol: alert.symbol,
                  price: currentPrice,
                  target: alert.targetPrice,
                });

                alert.status = "triggered";
                alert.triggeredAt = new Date();
                await alert.save();

                console.log(
                  `🚨 Alert triggered for ${alert.symbol} at ${currentPrice}`
                );
              }
            } catch (err) {
              console.error("⚠️ Error checking alert:", err);
            }
          }
        } catch (err) {
          console.error("⚠️ Error in alert loop:", err);
        }
      }, 5000);
    }

    initialized = true;
    console.log("🚀 Socket.IO initialized globally");
  }

  return new Response("Socket.IO server running", { status: 200 });
}
