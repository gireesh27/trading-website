"use client";

import React from "react";
import { WatchlistWidget } from "@/components/watchlist/watchlist-widget";
import { AlertsPanel } from "@/components/watchlist/AlertsPanel";
import { WatchlistSummary } from "@/components/watchlist/watchlistSummary";
import { useWatchlist } from "@/contexts/watchlist-context";

export default function WatchlistPage() {
  const { isLoading, watchlists } = useWatchlist();

  return (
    <main className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-white mb-1">Watchlists</h1>
          <p className="text-gray-400">
            Track and monitor your favorite stocks and cryptocurrencies in real-time.
          </p>
        </header>

        {/* Content */}
        {isLoading ? (
          <p className="text-gray-400">Loading your watchlists...</p>
        ) : watchlists.length === 0 ? (
          <p className="text-gray-400">
            No watchlists found. Start by creating a new one or adding stocks to an existing list.
          </p>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Watchlist Widget */}
            <div className="lg:col-span-2">
              <WatchlistWidget />
            </div>

            {/* Sidebar with Summary and Alerts */}
            <aside className="space-y-6">
              <WatchlistSummary />
              <AlertsPanel />
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
