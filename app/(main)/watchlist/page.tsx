"use client";

import React from "react";
import { WatchlistWidget } from "@/components/watchlist/watchlist-widget";
import { AlertsPanel } from "@/components/watchlist/AlertsPanel";
import { WatchlistSummary } from "@/components/watchlist/watchlistSummary";
import { WatchlistDisplay } from "@/components/watchlist/watchlistDisplay";
import { useWatchlist } from "@/contexts/watchlist-context";
import { Button } from "@/components/ui/button";
import { CreateWatchlistDialog } from "@/components/watchlist/create-watchlist-dialog";

export default function WatchlistPage() {
  const { isLoading, watchlists, activeWatchlist } = useWatchlist();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white">Your Watchlists</h1>
          <p className="text-gray-400">
            Track your favorite stocks and crypto assets in real-time.
          </p>
        </header>

        {/* Top Quick Add Widget */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Quick Add</h2>
          </div>
          <WatchlistWidget />
        </section>

        {/* Full Watchlist Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Manage Watchlists</h2>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <WatchlistDisplay />
          </div>
        </section>

        {/* Main Panel: Summary + Alerts + Widget */}
        <section>
          {isLoading ? (
            <div className="text-center py-16 text-gray-400">
              Loading your watchlists...
            </div>
          ) : !activeWatchlist?.items?.length ? (
            <div className="text-center py-16 space-y-4 text-gray-400">
              <p className="text-lg">Your current watchlist is empty.</p>
              <CreateWatchlistDialog trigger={<Button>Create Watchlist</Button>} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel */}
              <aside className="space-y-6">
                <WatchlistSummary />
                <AlertsPanel />
              </aside>

              {/* Right Panel */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-white">
                    {activeWatchlist.name}
                  </h2>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                  <WatchlistWidget />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
