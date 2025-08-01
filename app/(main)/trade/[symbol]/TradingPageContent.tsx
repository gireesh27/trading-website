"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  AdvancedTradingChart,
  CandlestickPoint,
  Stock,
  Range, // Import Range from advanced-trading-chart
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
  const [selectedRange, setSelectedRange] = useState<Range>("1mo");
  // Extract symbol from the URL path
  useEffect(() => {
    const pathParts = pathname.split("/");
    const symbolFromPath = pathParts[pathParts.length - 1];
    if (symbolFromPath) {
      setSymbol(symbolFromPath.toUpperCase());
    }
  }, [pathname]);

  // Helper to convert CandlestickData[] → CandlestickPoint[]
  const convertToCandlestickPoints = (data: any[]): CandlestickPoint[] => {
    return data.map((d) => ({
      timestamp: new Date(d.time).getTime(),
      time: d.time, // Add the 'time' property
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
  };

  // Initial load
  const fetchStockData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setIsChartLoading(true);
    setError(null);

    try {
      const quote = await stockApi.getQuote(symbol);
      const { chartData } = await stockApi.getFullChartData(
        symbol,
        "1mo",
        "1d"
      );

      setSelectedStock({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changesPercentage: quote.changePercent,
      });

      if (Array.isArray(chartData)) {
        const converted = convertToCandlestickPoints(chartData);
        setChartData(converted);
      } else {
        throw new Error("Invalid chart data format.");
      }
    } catch (err: any) {
      console.error("❌ Error fetching stock data:", err);
      setError(err?.message || "Failed to load stock data.");
    } finally {
      setIsLoading(false);
      setIsChartLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (symbol) {
      fetchStockData();
    }
  }, [symbol, fetchStockData]);

  // For range/interval switching inside the chart
  const handleChartDataFetch = useCallback(
    async (fetchSymbol: string, range: string, interval: string) => {
      setIsChartLoading(true);
      try {
        const { chartData } = await stockApi.getFullChartData(
          fetchSymbol,
          range,
          interval
        );
        if (Array.isArray(chartData)) {
          const converted = convertToCandlestickPoints(chartData);
          setChartData(converted);
        } else {
          throw new Error("Invalid chart data format.");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to update chart data.");
      } finally {
        setIsChartLoading(false);
      }
    },
    []
  );

  // Loading UI
  if (isLoading || !symbol) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Loading {symbol || "..."} Data...
          </h1>
          <Activity className="mx-auto mt-4 h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

  // Error UI
  if (error || !selectedStock) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-6 bg-gray-800 border border-red-500/50 rounded-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-400">
            Failed to Load {symbol}
          </h1>
          <p className="text-gray-300 mt-2">{error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Try another symbol or check your API key and network connection.
          </p>
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-900 p-4 min-h-screen">
      <div className="lg:col-span-2 xl:col-span-3">
        <AdvancedTradingChart
          symbol={symbol}
          selectedStock={selectedStock}
          chartCandlestickData={chartData}
          isChartLoading={isChartLoading}
          getCandlestickData={handleChartDataFetch}
          range={selectedRange} // ✅ NEW
        />
      </div>
      <div className="lg:col-span-1 xl:col-span-1">
        <EnhancedTradingInterface
          symbol={symbol}
          name={selectedStock.name}
          currentPrice={selectedStock.price || 0}
        />
      </div>
    </div>
  );
}
