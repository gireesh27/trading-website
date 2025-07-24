"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { EnhancedTradingInterface } from "@/components/enhanced-trading-interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvancedTradingChart, CandlestickPoint } from "@/components/advanced-trading-chart";
import { RefreshCw, AlertTriangle } from "lucide-react";
import {
  stockApi,
  StockQuote,
  CandlestickData,
  ChartApiResponse,
  CompanyProfile,
  CompanyStatistics,
  CompanyHoldings,
} from "@/lib/api/stock-api";
import { Stock } from "@/types/trading-types";
import { StockDetailsTabs } from "@/components/stock-details-tabs";
import { MarketDataProvider } from "@/contexts/enhanced-market-data-context";

// This mapping prevents invalid API calls by linking a range to a valid interval.
const rangeIntervalMap: { [key: string]: string } = {
  "1d": "5m",
  "5d": "15m",
  "1mo": "1h",
  "3mo": "1d",
  "6mo": "1d",
  "1y": "1d",
  "5y": "1w",
  "max": "1mo",
};

export default function EnhancedTradePage() {
  const params = useParams();
  const symbol = typeof params.symbol === "string" ? params.symbol.toUpperCase() : "";

  // State for all fetched data
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [fullApiResponse, setFullApiResponse] = useState<ChartApiResponse | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [statistics, setStatistics] = useState<CompanyStatistics | null>(null);
  const [holdings, setHoldings] = useState<CompanyHoldings | null>(null);

  // State for UI control
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (
    sym: string,
    range: string = "1y",
    // Interval is now determined by the range to prevent errors
    interval: string = rangeIntervalMap[range] || "1d"
  ) => {
    if (!sym) return;

    if (!stockQuote) setIsLoading(true);
    else setIsChartLoading(true);
    setError(null);

    try {
      const [chartResult, profileData, statsData, holdingsData, quoteData] = await Promise.all([
        stockApi.getFullChartData(sym, range, interval),
        stockApi.getProfile(sym),
        stockApi.getStatistics(sym),
        stockApi.getHoldings(sym),
        stockApi.getStockQuote(sym),
      ]);

      if (chartResult) {
        setChartData(chartResult.chartData);
        setFullApiResponse(chartResult.apiResponse);
      }
      
      setProfile(profileData);
      setStatistics(statsData);
      setHoldings(holdingsData);
      setStockQuote(quoteData);

    } catch (err: any) {
      console.error("Data fetching failed:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setIsChartLoading(false);
    }
  }, [stockQuote]);

  useEffect(() => {
    if (symbol) {
        fetchData(symbol, "1y", "1d");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const selectedStock: Stock | null = useMemo(() => {
    if (!stockQuote || !fullApiResponse) return null;
    return {
      symbol: stockQuote.symbol,
      name: fullApiResponse.meta.shortName || stockQuote.symbol,
      price: stockQuote.price,
      change: stockQuote.change,
      changePercent: stockQuote.changePercent,
    };
  }, [stockQuote, fullApiResponse]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <div className="text-center text-white bg-gray-800 p-8 rounded-lg shadow-lg">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold text-red-400 mb-2">Data Loading Failed</h1>
          <p className="text-gray-400 mb-6 max-w-sm">{error}</p>
          <Button onClick={() => fetchData(symbol)}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <h1 className="text-white">No stock data available.</h1>
      </div>
    );
  }

  return (
    <MarketDataProvider>
      <div className="min-h-screen bg-[#131722]">
        <MainNav />
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">{selectedStock.name}</h1>
              <Badge variant="outline" className="border-gray-600 text-gray-300">{selectedStock.symbol}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <AdvancedTradingChart
                symbol={selectedStock.symbol}
                name={selectedStock.name}
                selectedStock={selectedStock}
                chartCandlestickData={chartData as CandlestickPoint[]}
                isChartLoading={isChartLoading}
                getCandlestickData={fetchData}
                validRanges={fullApiResponse?.meta.validRanges}
                events={fullApiResponse?.events}
              />
            </div>
            <div className="lg:col-span-1">
              <EnhancedTradingInterface
                symbol={selectedStock.symbol}
                name={selectedStock.name}
                currentPrice={selectedStock.price}
              />
            </div>
          </div>
          
          <StockDetailsTabs
            profile={profile}
            statistics={statistics}
            holdings={holdings}
          />
        </div>
      </div>
    </MarketDataProvider>
  );
}
