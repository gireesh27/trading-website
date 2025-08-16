"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { NewsWidget } from "@/components/newsWidget";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { useAuth } from "@/contexts/auth-context";
import { TextGenerateEffect } from "@/components/ui/Text-Generate-Effect";
import Loader from "@/components/loader";
import { SparklesText } from "@/components/ui/TextSparkle";
import CryptoTicker from "@/components/slide-crypto";
import { WatchlistItems } from "@/components/watchlist/WatchlistItems";
import { Vortex } from "@/components/ui/vortex";
import { TextGenerateSameColour } from "@/components/ui/TextGenerateSameColour";
import HoldingsList from "@/components/Holdings/HoldingsList";
import OrdersListWidget from "@/components/Orders/OrderListWidget";
import { EnhancedTradingInterface } from "@/components/enhanced-trading-interface";
import { QuickTrade } from "@/components/quicktrade";
import AddMoneyButton from "@/components/razorpay/handleAddMoney";
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { stocks: marketData, selectedStock, selectStock } = useMarketData();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (marketData.length > 0 && !selectedStock)
      selectStock(marketData[0].symbol);
  }, [marketData, selectedStock, selectStock]);
  // Fetch holdings on mount
  useEffect(() => {
    async function fetchHoldings() {
      setLoading(true);
      try {
        const res = await fetch("/api/holdings");
        const data = await res.json();
        setHoldings(data?.holdings || []);
      } catch (err) {
        console.error("Failed to load holdings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHoldings();
  }, []);
  if (authLoading || !user)
    return (
      <div className="bg-[#131722] flex flex-col items-center justify-center relative mx-auto pt-12">
        <Loader />
      </div>
    );

  return (
    <div className="relative bg-[#131722] flex flex-col items-center justify-center pt-12 mx-auto">
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
          className="fixed inset-0 w-full h-full -z-10"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto px-4 pt-6 w-full max-w-[95vw]">
        {/* Crypto Ticker */}
        <div className="w-full rounded-lg bg-black/50 mt-2 overflow-hidden">
          <div className="flex items-center justify-start overflow-x-hidden">
            <CryptoTicker />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="flex items-end text-lg font-semibold text-white gap-2 mt-4">
          <span>Welcome back,</span>
          <SparklesText>{user.name}</SparklesText>
        </h1>
        <div className="text-lg mt-2">
          <TextGenerateSameColour
            words=" Monitor markets, manage your portfolio, and execute trades in real-time"
            className="flex flex-wrap gap-1 font-semibold"
          />
        </div>

        {/* Widgets: Flex layout 60/40 */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full">
          {/* News (60%) */}
          <div className="w-full lg:w-3/5 flex flex-col gap-6 overflow-x-hidden">
            <div className="w-full ">
              <NewsWidget />
            </div>
            <div className=" flex flex-col lg:flex-row gap-6 overflow-x-hidden">
              <div className="w-full lg:w-3/5">
                <QuickTrade />
              </div>
              <div className="w-full lg:w-2/5">
               <AddMoneyButton />
              </div>
            </div>
          </div>

          {/* Watchlist (40%) */}
          <div className="w-full lg:w-2/5 overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-6  w-full">
              <WatchlistItems />
            </div>
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              <HoldingsList holdings={holdings} />
            </div>
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              <OrdersListWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
