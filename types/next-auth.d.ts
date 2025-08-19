import NextAuth from "next-auth";
import type { Server as HTTPServer } from "http";
import type { Socket } from "net";
import type { Server as IOServer } from "socket.io";
import type { NextApiResponse } from "next";

declare module "next-auth" {
  interface Session {
    user: {
      walletBalance: any;
      walletPasswordHash:any;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string; // ✅ Custom property
    };
  }

  interface JWT {
    id: string; // ✅ So we can assign to session
  }
}

// ✅ Custom Next.js API Response type with Socket.IO support
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};
