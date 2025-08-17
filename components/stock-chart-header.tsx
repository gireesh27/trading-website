"use client";

import { useWatchlist } from "@/contexts/watchlist-context";
import { Button } from "@/components/ui/button";
import { Star, StarOff, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "react-toastify";
import { Stock } from "@/types/trading-types";
import { WatchlistButton } from "./Button-animation";

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
interface StockChartHeaderProps {
  stock: Stock | null | CryptoData;
  sector: string;
}

export function StockChartHeader({ stock, sector }: StockChartHeaderProps) {
  const { activeWatchlist, addToWatchlist, removeFromWatchlist, isLoading } =
    useWatchlist();

  if (!stock) return null;

  const isPositive = stock.change && stock.change >= 0;
  const changeColor = isPositive ? "text-emerald-400" : "text-red-400";
  const bgColor = isPositive ? "bg-emerald-500/10" : "bg-red-500/10";
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;

  // ✅ Ensure it's a strict boolean, not undefined
  const isInWatchlist = !!activeWatchlist?.items?.some(
    (item) => item.symbol === stock.symbol
  );

  const handleToggle = async () => {
    if (!activeWatchlist?._id) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(activeWatchlist._id, stock.symbol);
        toast.info(`${stock.symbol} removed from your watchlist.`);
      } else {
        await addToWatchlist(activeWatchlist._id, stock.symbol, sector);
        toast.success(`${stock.symbol} added to your watchlist.`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update watchlist.");
    }
  };

  return (
    <div className="mb-4 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-text">
            {stock.name}
          </span>
          <span className="ml-2 text-gray-300 text-xl font-medium tracking-wide">
            ({stock.symbol})
          </span>
        </h2>

        {/* 🎉 Animated Watchlist Button */}
        <WatchlistButton
          isInWatchlist={isInWatchlist}
          isLoading={isLoading}
          handleToggle={handleToggle}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mt-2">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
          ${stock.price?.toFixed(2)}
        </p>

        <div className={`flex items-center gap-2 ${changeColor}`}>
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold shadow-md backdrop-blur-sm ${bgColor}`}
          >
            <ChangeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="tracking-wide">
              {stock.changePercent?.toFixed(2)}%
            </span>
          </div>
          <span className="text-sm sm:text-base font-medium text-gray-300">
            {isPositive ? "+" : ""}
            {stock.change?.toFixed(2)} Today
          </span>
        </div>
      </div>
    </div>
  );
}
