// components/AlertsListener.tsx
"use client";
import { io } from "socket.io-client";
import { useEffect } from "react";

export default function AlertsListener() {
  useEffect(() => {
    const socket = io({
      path: "/api/alerts/socket",
    });

    socket.on("connect", () => {
      console.log("🔗 Connected:", socket.id);
    });

    socket.on("newAlert", (data) => {
      console.log("🚨 New Alert:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
}
