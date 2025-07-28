"use client";

import { useWatchlist } from "@/contexts/watchlist-context";
import { Button } from "@/components/ui/button";
import { Star, StarOff, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Stock } from "@/types/trading-types"; // Replace with your actual type path

export function StockChartHeader({ stock }: { stock: Stock | null }) {
  const { activeWatchlist, addToWatchlist, removeFromWatchlist, isLoading } = useWatchlist();
  const { toast } = useToast();

  if (!stock) return null;

  const isPositive = stock.change && stock.change >= 0;
  const changeColor = isPositive ? "text-emerald-400" : "text-red-400";
  const bgColor = isPositive ? "bg-emerald-500/10" : "bg-red-500/10";
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;

  const isInWatchlist = activeWatchlist?.items?.some((item) => item.symbol === stock.symbol);

  const handleToggle = async () => {
    if (!activeWatchlist?._id) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(activeWatchlist._id, stock.symbol);
        toast({
          title: "Removed",
          description: `${stock.symbol} removed from your watchlist.`,
          variant: "default",
        });
      } else {
        await addToWatchlist(activeWatchlist._id, stock.symbol);
        toast({
          title: "Added",
          description: `${stock.symbol} added to your watchlist.`,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update watchlist.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-4 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-white">
          {stock.name} <span className="text-gray-400">({stock.symbol})</span>
        </h2>

        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={handleToggle}
          className="text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isInWatchlist ? (
            <>
              <StarOff className="h-4 w-4 mr-2 text-yellow-400" />
              Remove from Watchlist
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2 text-yellow-400" />
              Add to Watchlist
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-x-4 gap-y-2 mt-2">
        <p className="text-4xl lg:text-5xl font-bold text-white">
          ${stock.price?.toFixed(2)}
        </p>

        <div className={`flex items-center gap-2 ${changeColor}`}>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-lg font-semibold ${bgColor}`}>
            <ChangeIcon className="h-5 w-5" />
            <span>{stock.changePercent?.toFixed(2)}%</span>
          </div>
          <span className="text-lg font-semibold">
            {isPositive ? "+" : ""}
            {stock.change?.toFixed(2)} Today
          </span>
        </div>
      </div>
    </div>
  );
}
