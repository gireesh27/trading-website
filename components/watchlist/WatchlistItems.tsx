"use client";

import { motion } from "framer-motion";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useRouter } from "next/navigation";
import { WatchlistItem } from "@/types/watchlistypes"; // adjust path as needed
import { Eye, Info, TrendingDown, TrendingUp } from "lucide-react";

export function WatchlistItems() {
  const { watchlists } = useWatchlist();
  const router = useRouter();

  // Flatten all items from all watchlists
  const allItems: WatchlistItem[] = watchlists.flatMap((wl) =>
    (wl.items ?? []).map((stock) => ({
      symbol: stock.symbol,
      sector: stock.sector,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      addedAt: stock.addedAt,
      alerts: stock.alerts,
    }))
  );

  const remainingItems = allItems;

  return (
    <div className="mt-6 w-full max-w-xl mx-auto">
      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-7 h-7 text-cyan-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Your Watchlists
          </h2>
        </div>

        {/* Watchlist Content */}
        {allItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-4">
            <Info size={40} />
            <p>Your watchlist is empty.</p>
            <p className="text-sm">Add stocks to start tracking.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {remainingItems.map((item, i) => (
              <motion.div
                key={`${item.symbol}-${i}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group flex justify-between items-center p-3 bg-slate-800/60 rounded-lg border-l-2 border-slate-700 hover:border-cyan-400 hover:bg-slate-800/90 transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/trade/${item.symbol}`)}
              >
                {/* Symbol and Name */}
                <div>
                  <div className="font-bold text-base text-slate-100">{item.symbol}</div>
                  <div className="text-xs text-slate-400">{item.name}</div>
                </div>

                {/* Price and Change */}
                <div className="text-right">
                  <div className="font-semibold text-slate-50">
                    ₹{item.price?.toFixed(2) ?? "N/A"}
                  </div>
                  <div className={`flex items-center justify-end gap-1 text-sm font-medium ${(item.change ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {(item.change ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{(item.changePercent ?? 0).toFixed(2)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
