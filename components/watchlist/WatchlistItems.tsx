"use client";

import { useWatchlist } from "@/contexts/watchlist-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function WatchlistItems() {
  const { watchlists, removeFromWatchlist } = useWatchlist();
  const router = useRouter();

  // Flatten all items from all watchlists
  const allItems = watchlists.flatMap((wl) =>
    (wl.items ?? []).map((item) => ({
      ...item,
      watchlistId: wl._id, // keep track for removal
    }))
  );

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold text-white tracking-tight">
        🗂️ Your Watchlists
      </h2>

      {allItems.length === 0 ? (
        <p className="text-gray-400 italic text-center">
          No items in your watchlists.
        </p>
      ) : (
        <div className="flex flex-col gap-4 overflow-x-hidden">
          {allItems.map((item) => (
            <div
              key={`${item.watchlistId}-${item.symbol}`}
              className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition cursor-pointer"
              onClick={() => router.push(`/trade/${item.symbol}`)}
            >
              <div className="text-white font-medium">{item.symbol}</div>
              <div className="text-sm text-right text-gray-300">
                <div>{item.name}</div>
                <div className="text-xs">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchlist(item.watchlistId, item.symbol);
                }}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
