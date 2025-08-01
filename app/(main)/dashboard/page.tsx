"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { WatchlistWidget } from "@/components/watchlist/watchlist-widget";
import { NewsWidget } from "@/components/newsWidget";
import { QuickActions } from "@/components/quickActions";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { useAuth } from "@/contexts/auth-context";
import HoldingsChart from "@/components/Holdings/HoldingsChart";
export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    stocks: marketData,
    getCandlestickData,
    selectedStock,
    selectStock,
  } = useMarketData();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (marketData.length > 0 && !selectedStock) {
      selectStock(marketData[0].symbol);
    }
  }, [marketData, selectedStock, selectStock]);


  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131722]">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your investments today.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <HoldingsChart />
            <NewsWidget />
          </div>
          {/* Sidebar Column */}
          <div className="space-y-6">
            <QuickActions />
            <WatchlistWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
