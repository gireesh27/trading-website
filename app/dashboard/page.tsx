"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { WatchlistWidget } from "@/components/watchlist/watchlist-widget";
import { NewsWidget } from "@/components/newsWidget";
import { QuickActions } from "@/components/quickActions";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedTradingChart } from "@/components/advanced-trading-chart";
import { useWatchlist } from "@/contexts/watchlist-context";
import { Time, CandlestickData } from "lightweight-charts";
import { Stock } from "@/types/trading-types";

// Local fallback type for candlestick data
export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { activeWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const router = useRouter();

  const {
    stocks: marketData,
    getCandlestickData,
    selectedStock,
    selectStock,
  } = useMarketData();

  const [candlestickData, setCandlestickData] = useState<CandlestickPoint[]>([]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Auto-select first stock on initial load
  useEffect(() => {
    if (marketData.length > 0 && !selectedStock) {
      selectStock(marketData[0].symbol);
    }
  }, [marketData, selectedStock, selectStock]);

  // Fetch candlestick data on selected stock change
  useEffect(() => {
    if (selectedStock) {
      const fetchData = async () => {
        const rawData = await getCandlestickData(selectedStock.symbol, "1D");

        if (rawData && Array.isArray(rawData)) {
          const transformedData: CandlestickPoint[] = rawData.map((item) => ({
            time: new Date(item.timestamp).toISOString(),
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));

          setCandlestickData(transformedData);
        }
      };

      fetchData();
    }
  }, [selectedStock, getCandlestickData]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131722]">
      <MainNav />
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
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioSummary />

            {selectedStock && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {selectedStock.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdvancedTradingChart
                    symbol={selectedStock.symbol}
                    name={selectedStock.name}
                    currentPrice={selectedStock.price}
                    chartCandlestickData={candlestickData} selectedStock={null} selectStock={function (stock: Stock): void {
                      throw new Error("Function not implemented.");
                    } } addToWatchlist={function (symbol: string): void {
                      throw new Error("Function not implemented.");
                    } } removeFromWatchlist={function (symbol: string): void {
                      throw new Error("Function not implemented.");
                    } } activeWatchlist={[]} getCandlestickData={function (symbol: string, timeframe?: string): void {
                      throw new Error("Function not implemented.");
                    } }                    
                  />
                </CardContent>
              </Card>
            )}

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
