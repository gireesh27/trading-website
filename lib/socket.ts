// lib/socket.ts
import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: IOServer | null = null;

export const initIO = (server: HTTPServer) => {
  if (!io) {
    io = new IOServer(server, {
      path: "/api/alerts/socket",
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      socket.on("subscribe", (userId: string) => {
        console.log(`📌 User ${userId} subscribed`);
        socket.join(userId);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    console.log("🚀 Socket.IO initialized");
  }

  return io;
};

export const getIO = () => io;
