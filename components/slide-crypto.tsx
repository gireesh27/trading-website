"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

export interface CryptoData {
  symbol: string;
  sector?: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  change24h?: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  rank?: number;
  dominance?: number;
}
export default function CryptoTicker() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);

  const fetchCryptoData = useCallback(async () => {
    try {
      const response = await fetch(`/api/crypto/quotes`);
      if (!response.ok) throw new Error("Failed to fetch crypto data");

      const quotes = await response.json();

      const normalized = quotes.map((q: any) => ({
        symbol: q.symbol,
        price: q.price,
        changePercent: q.changePercent,
      }));

      setCryptoData(normalized);
    } catch (error) {
      console.error("❌ Error in fetchCryptoData:", error);
    }
  }, []);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  const tickerItems = [...cryptoData, ...cryptoData];

  return (
    <div className="overflow-hidden bg-zinc-900 border-t border-b border-zinc-800">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-20%"] }} // only move 20% of width
        transition={{
          repeat: Infinity,
          duration: 60, // slower: 60s per cycle
          ease: "linear",
        }}
      >
        {tickerItems.map((crypto, index) => (
          <div
            key={`${crypto.symbol}-${index}`}
            className="flex items-center gap-2 px-6 py-3 border-r border-zinc-800"
          >
            <span className="font-bold text-white">{crypto.symbol}</span>
            <span className="text-zinc-400">${crypto.price.toFixed(2)}</span>
            <span
              className={
                crypto.changePercent > 0
                  ? "text-green-500"
                  : crypto.changePercent < 0
                  ? "text-red-500"
                  : "text-zinc-400"
              }
            >
              {crypto.changePercent > 0 ? "+" : ""}
              {crypto.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
