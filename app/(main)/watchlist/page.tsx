"use client";

import React from "react";
import { WatchlistWidget } from "@/components/watchlist/watchlist-widget";
import { AlertsPanel } from "@/components/watchlist/AlertsPanel";
import { WatchlistSummary } from "@/components/watchlist/watchlistSummary";
import { WatchlistDisplay } from "@/components/watchlist/watchlistDisplay";
import { useWatchlist } from "@/contexts/watchlist-context";
import { Button } from "@/components/ui/button";
import { CreateWatchlistDialog } from "@/components/watchlist/create-watchlist-dialog";
import { motion } from "framer-motion";
import Loader from "@/components/loader";
import { useAuth } from "@/contexts/auth-context";
import VantaNetBackground from "@/components/ui/VantaNetBackground";
import { TextGenerateEffect } from "@/components/ui/Text-Generate-Effect";
export default function WatchlistPage() {
  const { isLoading, watchlists, activeWatchlist } = useWatchlist();
  const { user } = useAuth();
  if (isLoading || !user) {
    return (
      <div className="bg-[#131722] flex flex-col items-center justify-center pt-20">
        <Loader />
      </div>
    );
  }
  return (
    <main className="relative min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <VantaNetBackground />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 px-4 pt-20">
        {/* Page Header */}
        <motion.header
          className="flex flex-col items-center justify-center text-center space-y-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 animate-gradient-x">
            📈 Your Watchlists
          </h1>
          <div className="flex flex-wrap justify-center gap-1 font-semibold text-center">
            <TextGenerateEffect words=" Track your Favourite stocks and Crypto assets in Real Time" />
          </div>
        </motion.header>

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
            <h2 className="text-xl font-semibold text-white">
              Manage Watchlists
            </h2>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm p-4">
            <WatchlistDisplay />
          </div>
        </section>

        {/* Main Panel */}
        <section>
          {isLoading ? (
            <div className="text-center py-16 text-gray-300">
              Loading your watchlists...
            </div>
          ) : !activeWatchlist?.items?.length ? (
            <div className="text-center py-16 space-y-4 text-gray-300">
              <p className="text-lg">Your current watchlist is empty.</p>
              <CreateWatchlistDialog
                trigger={<Button>Create Watchlist</Button>}
              />
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
                <div className="rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm p-4">
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
