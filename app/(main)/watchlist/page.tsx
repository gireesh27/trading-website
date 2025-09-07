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
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { TextGenerateSameColour } from "@/components/ui/TextGenerateSameColour";
export default function WatchlistPage() {
  const { isLoading, watchlists, activeWatchlist } = useWatchlist();
  const { user } = useAuth();
  if (isLoading || !user) {
    return (
      <div className="bg-[#131722] flex flex-col items-center justify-center ">
        <Loader />
      </div>
    );
  }
  return (
    <main className="w-full h-full bg-gray-900 relative   flex items-center justify-center px-4">
      <BackgroundBeamsWithCollision className=" fixed inset-0 z-0  pointer-events-none bg-gradient-to-br from-[#1a1c2b]/90 via-[#2a2c3d]/70 to-[#1a1c2b]/90">
        <div className=" bg-purple-500  " />
        <div className=" bg-blue-500  " />
        <div className=" bg-pink-500 " />
        <div className=" bg-red-500  " />
        <div className=" bg-yellow-500  " />
      </BackgroundBeamsWithCollision>
      {/* Foreground content */}
      <div className=" z-10 ">
        {/* Page Header */}
        <motion.header
          className="flex flex-col items-start justify-center  space-y-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 animate-gradient-x">
            Your Watchlists
          </h1>
          <div className="flex flex-wrap justify-center gap-1 font-semibold text-center">
            <TextGenerateSameColour words=" Track your Favourite stocks and Crypto assets in Real Time" />
          </div>
        </motion.header>

        {/* Top Quick Add Widget */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Quick Add</h2>
          </div>
          <WatchlistWidget />
        </div>

        {/* Full Watchlist Management */}
        <div>
          <div className="flex items-center justify-between my-4">
            <h2 className="text-xl font-semibold text-white">
              Manage Watchlists
            </h2>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm p-4">
            <WatchlistDisplay />
          </div>
        </div>

        {/* Main Panel */}
        <div>
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
        </div>
      </div>
    </main>
  );
}
