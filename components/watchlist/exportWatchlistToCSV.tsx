"use client";

import React from "react";
import { WatchlistProvider } from "@/contexts/watchlist-context";
import { WatchlistWidget } from "@/components/watchlist/watchlist-widget";
import { WatchlistSummary } from "./watchlistSummary";
import { AlertsPanel } from "./AlertsPanel";
// import { EnhancedTradingInterface } from "../enhanced-trading-interface";

export function TradingDashboard() {

  return (
    <WatchlistProvider>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Left Sidebar: Watchlist and Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <WatchlistWidget />
          <WatchlistSummary />
          <AlertsPanel />
        </div>
      </div>
    </WatchlistProvider>
  );
}
