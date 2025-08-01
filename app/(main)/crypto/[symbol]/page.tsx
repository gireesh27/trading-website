"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { stockApi } from "@/lib/api/stock-api";
import { AdvancedTradingChart } from "@/components/advanced-trading-chart";
import type { CryptoData } from "@/types/crypto-types";
import type { CandlestickPoint } from "@/types/trading-types";
import { EnhancedTradingInterface } from "@/components/enhanced-trading-interface";

const getCleanSymbol = (raw: string): string =>
  raw.replace("-USD", "").toUpperCase();

const normalizeToYahooSymbol = (clean: string): string => `${clean}-USD`;

export default function CryptoSymbolPage() {
  const { symbol } = useParams() as { symbol: string };

  const [selectedStock, setSelectedStock] = useState<CryptoData | null>(null);
  const [chartCandlestickData, setChartCandlestickData] = useState<
    CandlestickPoint[]
  >([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = "1y";
  const interval = "1d";

  const loadChartData = useCallback(
    async (symbol: string, range: string = "1mo", interval: string = "1h") => {
      try {
        const { chartData } = await stockApi.getFullChartData(
          symbol,
          range,
          interval
        );

        if (Array.isArray(chartData)) {
          const transformed: CandlestickPoint[] = chartData.map((item) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
            timestamp: new Date(item.time).getTime() / 1000,
          }));

          setChartCandlestickData(transformed);
        } else {
          throw new Error("Invalid chart data format");
        }
      } catch (err) {
        console.error("❌ Error loading chart data:", err);
        setError("Error loading chart data");
      }
    },
    []
  );

  const fetchSelectedCrypto = useCallback(
    async (symbol: string) => {
      setLoadingPage(true);
      setError(null);

      try {
        const yahooSymbol = normalizeToYahooSymbol(symbol); // e.g., ETH → ETH-USD

        // ✅ Use full chart data, which includes quote + chart
        const { chartData, apiResponse } = await stockApi.getFullChartData(
          yahooSymbol,
          range,
          interval
        );

        // ✅ Extract quote data from apiResponse
        const priceData = apiResponse?.chart?.result?.[0]?.meta;

        if (!priceData || !chartData || chartData.length === 0) {
          throw new Error("Missing or invalid data from chart API");
        }

        setSelectedStock({
          symbol: yahooSymbol,
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

        // ✅ Transform and set chart data
        const transformed: CandlestickPoint[] = chartData.map((item) => ({
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          timestamp: new Date(item.time).getTime() / 1000,
        }));

        setChartCandlestickData(transformed);
      } catch (err: any) {
        console.error("❌ Error loading crypto full chart data:", err);
        setError(err?.message || "Failed to load crypto chart data");
      } finally {
        setLoadingPage(false);
      }
    },
    [loadChartData]
  );

  useEffect(() => {
    if (symbol) {
      const clean = getCleanSymbol(symbol); // ETH
      fetchSelectedCrypto(clean); // Pass ETH to normalize internally
    }
  }, [symbol, fetchSelectedCrypto]);

  if (loadingPage && !selectedStock) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#131722] p-6 text-white">
      {selectedStock && (
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-2/3 w-full">
            <AdvancedTradingChart
              symbol={selectedStock.symbol}
              selectedStock={selectedStock}
              chartCandlestickData={chartCandlestickData}
              isChartLoading={loadingPage}
              getCandlestickData={loadChartData}
              range={range}
            />
          </div>
          <div className="lg:w-1/3 w-full">
            <EnhancedTradingInterface
              symbol={symbol}
              name={selectedStock.name}
              currentPrice={selectedStock.price || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
