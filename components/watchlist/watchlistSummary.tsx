"use client";

import React, { useMemo } from "react";
import { useWatchlist } from "@/contexts/watchlist-context";
import { Card, CardContent } from "../ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

export function WatchlistSummary() {
  const { activeWatchlist } = useWatchlist();

  const summary = useMemo(() => {
    if (!activeWatchlist || !activeWatchlist.items || activeWatchlist.items.length === 0) {
      return {
        total: 0,
        gainers: [],
        losers: [],
        topGainer: null,
        topLoser: null,
      };
    }

    const gainers = activeWatchlist.items.filter((item) => (item.changePercent ?? 0) > 0);
    const losers = activeWatchlist.items.filter((item) => (item.changePercent ?? 0) < 0);

    const topGainer =
      gainers.length > 0
        ? gainers.reduce((max, item) =>
            (item.changePercent ?? 0) > (max.changePercent ?? 0) ? item : max
          )
        : null;

    const topLoser =
      losers.length > 0
        ? losers.reduce((min, item) =>
            (item.changePercent ?? 0) < (min.changePercent ?? 0) ? item : min
          )
        : null;

    return {
      total: activeWatchlist.items.length,
      gainers,
      losers,
      topGainer,
      topLoser,
    };
  }, [activeWatchlist]);

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Watchlist Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>Total Stocks</div>
          <div>{summary.total}</div>
          <div>Gainers</div>
          <div>{summary.gainers.length}</div>
          <div>Losers</div>
          <div>{summary.losers.length}</div>
        </div>

        {summary.topGainer && (
          <div className="pt-2 text-green-400">
            <ArrowUp className="inline w-4 h-4 mr-1" />
            Top Gainer: {summary.topGainer.symbol} ({summary.topGainer.changePercent?.toFixed(2)}%)
          </div>
        )}

        {summary.topLoser && (
          <div className="text-red-400">
            <ArrowDown className="inline w-4 h-4 mr-1" />
            Top Loser: {summary.topLoser.symbol} ({summary.topLoser.changePercent?.toFixed(2)}%)
          </div>
        )}

        {!summary.topGainer && !summary.topLoser && (
          <p className="text-gray-500 text-sm">No price change data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
