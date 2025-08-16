"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { WatchlistWidget } from "@/components/watchlist/watchlist-widget";
import { NewsWidget } from "@/components/newsWidget";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { useAuth } from "@/contexts/auth-context";
import { TextHoverEffect } from "@/components/ui/Text-Hover-Effect";
import { Vortex } from "@/components/ui/vortex";
import { TextGenerateEffect } from "@/components/ui/Text-Generate-Effect";
import Loader from "@/components/loader";
import { SparklesText } from "@/components/ui/TextSparkle";
import CryptoTicker from "@/components/slide-crypto";
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
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (marketData.length > 0 && !selectedStock) {
      selectStock(marketData[0].symbol);
    }
  }, [marketData, selectedStock, selectStock]);

  if (authLoading || !user) {
    return (
      <div className="bg-[#131722] flex flex-col items-center justify-center pt-2">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative bg-[#131722] items-center justify-center flex flex-col pt-12 mx-auto">
      {/* Vortex Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Vortex
          particleCount={800}
          rangeY={100}
          baseHue={420}
          baseSpeed={0.2}
          rangeSpeed={1.5}
          baseRadius={1}
          rangeRadius={2}
          backgroundColor="transparent"
          className="fixed  inset-0 w-full h-full -z-10"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto px-4 pt-6">
        <div className="mb-8">
          <CryptoTicker/>
          <h1 className="flex  items-end text-lg font-semibold text-white gap-2">
            <span>Welcome back,</span>
            <SparklesText>{user.name}</SparklesText>
          </h1>

          <div className="text-lg">
            <TextGenerateEffect
              words=" Monitor markets, manage your portfolio, and execute trades in real-time"
              className="flex flex-wrap gap-1 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 h-full">
            <NewsWidget />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6 col-span-1">
            <WatchlistWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
