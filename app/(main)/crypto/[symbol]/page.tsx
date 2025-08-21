"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AdvancedTradingChart } from "@/components/advanced-trading-chart";
import type { CryptoData } from "@/types/crypto-types";
import type { CandlestickPoint } from "@/types/trading-types";
import { EnhancedTradingInterface } from "@/components/enhanced-trading-interface";
import { CryptoNewsFeed } from "@/components/Crypto-News";

const getCleanSymbol = (raw: string): string =>
  raw.replace("-USD", "").toUpperCase();

const normalizeToYahooSymbol = (clean: string): string => `${clean}-USD`;

export default function CryptoSymbolPage() {
  const { symbol } = useParams() as { symbol: string };
  const { sector } = useParams() as { sector: string };
  const [selectedStock, setSelectedStock] = useState<CryptoData | null>(null);
  const [chartCandlestickData, setChartCandlestickData] = useState<
    CandlestickPoint[]
  >([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = "1y";
  const interval = "1d";
const handleChartDataFetch = useCallback(
  async (fetchSymbol: string, range: string, interval: string) => {
    try {
      const res = await fetch(
        `/api/stocks/chart?symbol=${encodeURIComponent(
          fetchSymbol
        )}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(
          interval
        )}`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch chart data (${res.status})`);
      }

      const { chartData } = await res.json();

      if (Array.isArray(chartData)) {
        const converted = convertToCandlestickPoints(chartData);
        return converted; // ✅ return the converted data
      } else {
        throw new Error("Invalid chart data format.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update chart data.");
      return [];
    } 
  },
  []
);

// ✅ reuse conversion helper
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
 const loadChartData = useCallback(
  async (symbol: string, range: string = "1mo", interval: string = "1h") => {
    try {
      const data = await handleChartDataFetch(symbol, range, interval);

      if (data.length > 0) {
        setChartCandlestickData(data);
      }
    } catch (err) {
      console.error("❌ Error loading chart data:", err);
      setError("Error loading chart data");
    }
  },
  [handleChartDataFetch]
);
  const fetchSelectedCrypto = useCallback(async (symbol: string) => {
    setLoadingPage(true);
    setError(null);

    try {
      const yahooSymbol = normalizeToYahooSymbol(symbol); // e.g., ETH → ETH-USD

      // Fetch full chart data from your API route with Redis caching
      const res = await fetch(
        `/api/stocks/chart?symbol=${encodeURIComponent(
          yahooSymbol
        )}&range=${range}&interval=${interval}`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch crypto chart data (${res.status})`);
      }

      const { chartData, apiResponse } = await res.json();

      // Extract quote data from apiResponse.meta (similar to your original code)
      const priceData = apiResponse?.chart?.result?.[0]?.meta;

      if (!priceData || !chartData || chartData.length === 0) {
        throw new Error("Missing or invalid data from chart API");
      }

      setSelectedStock({
        symbol: yahooSymbol,
        sector: "crypto",
        name: priceData.symbol || yahooSymbol,
        price: priceData.regularMarketPrice ?? 0,
        change: priceData.regularMarketChange ?? 0,
        changePercent: priceData.regularMarketChangePercent ?? 0,
        volume: priceData.totalVolume ?? 0,
        marketCap: priceData.marketCap ?? 0,
        high: priceData.regularMarketDayHigh ?? 0,
        low: priceData.regularMarketDayLow ?? 0,
        rank: undefined,
        dominance: undefined,
      });

      // Transform chart data for charting
      const transformed: CandlestickPoint[] = chartData.map(
        (item: {
          time: string | number | Date;
          open: any;
          high: any;
          low: any;
          close: any;
          volume: any;
        }) => ({
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          timestamp: new Date(item.time).getTime() / 1000,
        })
      );

      setChartCandlestickData(transformed);
    } catch (err: any) {
      console.error("❌ Error loading crypto full chart data:", err);
      setError(err?.message || "Failed to load crypto chart data");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    if (symbol) {
      const clean = getCleanSymbol(symbol); // ETH
      fetchSelectedCrypto(clean); // Pass ETH to normalize internally
    }
  }, [symbol, fetchSelectedCrypto]);

  if (loadingPage && !selectedStock) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center pt-20">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-900 px-4 text-white pt-20">
      {selectedStock && (
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          {/* Left side: Chart + News */}
          <div className="w-full flex flex-col gap-6 lg:w-3/4">
            {/* AdvancedTradingChart */}
            <div className="w-full rounded-2xl backdrop-blur-md shadow-md ">
              <AdvancedTradingChart
                symbol={selectedStock.symbol}
                selectedStock={selectedStock}
                chartCandlestickData={chartCandlestickData}
                isChartLoading={loadingPage}
                getCandlestickData={loadChartData}
                range={range}
                sector="crypto"
              />
            </div>

            {/* CryptoNewsFeed */}
            <div className="w-full backdrop-blur-md shadow-md">
              <CryptoNewsFeed symbol={symbol} />
            </div>
          </div>

          {/* Right side: Trading Interface */}
          <div className="lg:w-1/4 w-full ">
            <EnhancedTradingInterface
              symbol={symbol}
              sector="crypto"
              name={selectedStock.name}
              currentPrice={selectedStock.price || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
