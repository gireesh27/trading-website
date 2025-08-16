"use client";

import { motion } from "framer-motion";
import { useWatchlist } from "@/contexts/watchlist-context";
import { useRouter } from "next/navigation";
import { WatchlistItem } from "@/types/watchlistypes"; // adjust path as needed

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
    <div className="mt-6 space-y-3 w-full max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
         Your Watchlists
      </h2>

      {allItems.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No stocks in your watchlists
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          
          {remainingItems.length > 0 && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 smooth-scroll">
              {remainingItems.map((item, i) => (
                <motion.div
                  key={`${item.symbol}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition cursor-pointer"
                  onClick={() => router.push(`/trade/${item.symbol}`)}
                >
                  <div className="font-bold text-white">{item.symbol}</div>
                  <div className="text-sm text-gray-300 text-right">
                    <div>{item.name}</div>
                    <div>
                      ₹{item.price?.toFixed(2) ?? "N/A"}{" "}
                      <span
                        className={
                          (item.change ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        ({(item.changePercent ?? 0).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
