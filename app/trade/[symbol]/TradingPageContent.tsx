"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  AdvancedTradingChart,
  CandlestickPoint,
  Stock,
} from "@/components/advanced-trading-chart";
import { EnhancedTradingInterface } from "@/components/enhanced-trading-interface";
import { Activity } from "lucide-react";
import { stockApi } from "@/lib/api/stock-api";

export default function TradingPageContent() {
  const pathname = usePathname();
  const [symbol, setSymbol] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<CandlestickPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pathParts = pathname.split('/');
    const symbolFromPath = pathParts[pathParts.length - 1];
    if (symbolFromPath) {
      setSymbol(symbolFromPath.toUpperCase());
    }
  }, [pathname]);

  const fetchStockData = useCallback(async () => {
    if (!symbol) {
      return;
    }

    setIsLoading(true);
    setIsChartLoading(true);
    setError(null);

    try {
      console.log("[TradePage] Fetching data for:", symbol);

      const [quote, chart] = await Promise.all([
        stockApi.getQuote(symbol),
        stockApi.getFullChartData(symbol, "1mo", "1d"),
      ]);

      setSelectedStock({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changesPercentage: quote.changePercent,
      });

      setChartData(chart.chartData);
    } catch (err: any) {
      console.error("❌ Error fetching stock data:", err);
      setError(err?.message || "Failed to load stock data.");
    } finally {
      setIsLoading(false);
      setIsChartLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  const handleChartDataFetch = useCallback(
    async (fetchSymbol: string, range: string, interval: string) => {
      setIsChartLoading(true);
      try {
        const chart = await stockApi.getFullChartData(fetchSymbol, range, interval);
        setChartData(chart.chartData);
      } catch (err: any) {
        setError(err?.message || "Failed to update chart data.");
      } finally {
        setIsChartLoading(false);
      }
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading {symbol || '...'} Data...</h1>
          <Activity className="mx-auto mt-4 h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !selectedStock) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-6 bg-gray-800 border border-red-500/50 rounded-lg">
          <h1 className="text-2xl font-bold text-red-400">Failed to Load {symbol}</h1>
          <p className="text-gray-300 mt-2 max-w-md">{error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Try another symbol or check your API key and network connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-900 p-4 min-h-screen">
      <div className="lg:col-span-2 xl:col-span-3">
        <AdvancedTradingChart
         
          selectedStock={selectedStock}
          chartCandlestickData={chartData}
          isChartLoading={isChartLoading}
          getCandlestickData={handleChartDataFetch} symbol={""}        />
      </div>
      <div className="lg:col-span-1 xl:col-span-1">
        <EnhancedTradingInterface
         
          name={selectedStock.name}
          currentPrice={selectedStock.price || 0} symbol={""}        />
      </div>
    </div>
  );
}