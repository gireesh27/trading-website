"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  AdvancedTradingChart,
  CandlestickPoint,
  Stock,
  Range,
} from "@/components/advanced-trading-chart";
import { EnhancedTradingInterface } from "@/components/enhanced-trading-interface";
import { Activity } from "lucide-react";
import { stockApi } from "@/lib/api/stock-api";
import StockMetricsDisplay from "@/components/Market-Metrics";
import StockFinancialsReportDisplay from "@/components/Financial_Report";
import { CompanyNewsFeed } from "@/components/CompanyNewsFeed";

export default function TradingPageContent() {
  const pathname = usePathname();
  const [symbol, setSymbol] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<CandlestickPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<Range>("1mo");

  useEffect(() => {
    const pathParts = pathname.split("/");
    const symbolFromPath = pathParts[pathParts.length - 1];
    if (symbolFromPath) {
      setSymbol(symbolFromPath.toUpperCase());
    }
  }, [pathname]);

  const convertToCandlestickPoints = (data: any[]): CandlestickPoint[] => {
    return data.map((d) => ({
      timestamp: new Date(d.time).getTime(),
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
  };

  const fetchStockData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setIsChartLoading(true);
    setError(null);

    try {
      // Fetch stock quote from your new API route
      const quoteRes = await fetch(`/api/stocks/quote?symbol=${symbol}`);
      if (!quoteRes.ok)
        throw new Error(`Failed to fetch quote (${quoteRes.status})`);
      const quote = await quoteRes.json();

      // Fetch chart data from your chart API route with range and interval
      const chartRes = await fetch(
        `/api/stocks/chart?symbol=${symbol}&range=1mo&interval=1d`
      );
      if (!chartRes.ok)
        throw new Error(`Failed to fetch chart data (${chartRes.status})`);
      const { chartData } = await chartRes.json();

      // Set stock info
      setSelectedStock({
        symbol: quote.symbol,
        sector: "Markets",
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
      });

      // Set chart data after conversion
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

  const handleChartDataFetch = useCallback(
    async (fetchSymbol: string, range: string, interval: string) => {
      setIsChartLoading(true);
      try {
        const res = await fetch(
          `/api/stocks/chart?symbol=${encodeURIComponent(
            fetchSymbol
          )}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(
            interval
          )}`
        );

        if (!res.ok)
          throw new Error(`Failed to fetch chart data (${res.status})`);

        const { chartData } = await res.json();

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

  if (isLoading || !symbol) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Loading {symbol || "..."} Data...
          </h1>
          <Activity className="mx-auto mt-4 h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !selectedStock) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white pt-20">
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-900 p-4 min-h-screen pt-20">
      <div className="lg:col-span-2 xl:col-span-3">
        <AdvancedTradingChart
          symbol={symbol}
          selectedStock={selectedStock}
          chartCandlestickData={chartData}
          isChartLoading={isChartLoading}
          getCandlestickData={handleChartDataFetch}
          range={selectedRange}
          sector="Markets"
        />
        <StockFinancialsReportDisplay symbol={symbol} />
        <CompanyNewsFeed symbol={symbol} />
      </div>
      <div className="lg:col-span-1 xl:col-span-1 space-y-4 ">
        <EnhancedTradingInterface
          symbol={symbol}
          sector="Markets"
          name={selectedStock.name}
          currentPrice={selectedStock.price || 0}
        />
        <StockMetricsDisplay symbol={symbol} />
      </div>
    </div>
  );
}
