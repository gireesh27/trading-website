"use client"
import React from 'react'
import { WatchlistWidget } from '@/components/watchlist/watchlist-widget'
import { AlertsPanel } from '@/components/watchlist/AlertsPanel'
import { WatchlistSummary } from '@/components/watchlist/watchlistSummary'

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Watchlists</h1>
          <p className="text-gray-400">Track and monitor your favorite stocks and cryptocurrencies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Watchlist Widget */}
          <div className="lg:col-span-2">
            <WatchlistWidget />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <WatchlistSummary />
            <AlertsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}