"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  stockApi,
  StockQuote,
  CandlestickData,
} from "@/lib/api/stock-api";
import { newsAPI, NewsItem } from "@/lib/api/news-api";
import { cryptoApi, CryptoQuote } from "@/lib/api/crypto-api";

interface MarketDataContextType {
  stocks: StockQuote[];
  news: NewsItem[];
  technicalIndicators: any[];
  crypto: CryptoQuote[];
  candlestickData: CandlestickData[];
  selectedStock: StockQuote | null;
  isLoading: boolean;
  candlestickLoading: boolean;
  error: string | null;

  refreshData: () => void;
  selectStock: (symbol: string) => void;
  getCandlestickData: (
    symbol: string,
    range?: string,
    interval?: string
  ) => Promise<CandlestickData[]>;
  getQuote: (symbol: string) => Promise<StockQuote | null>;
  selectedSymbol: string  | null;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);
  export interface TechnicalIndicators {
  rsi?: number[];
  sma20?: number[];
  ema12?: number[];
  macd?: {
    line?: number[];
    signal?: number[];
    histogram?: number[];
  };
}
export const MarketDataProvider = ({ children }: { children: ReactNode }) => {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [crypto, setCrypto] = useState<CryptoQuote[]>([]);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [candlestickLoading, setCandlestickLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const candlestickCache = useRef<Map<string, CandlestickData[]>>(new Map());
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const trackedSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN"];

  const refreshData = useCallback(() => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    refreshTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [stockData, newsData, cryptoData] = await Promise.all([
          stockApi.getMultipleQuotes(trackedSymbols),
          newsAPI.getMarketNews("general"),
          cryptoApi.getMultipleCryptoQuotes(["BTC", "ETH", "SOL", "ADA"]),
        ]);

        setStocks(stockData);
        setNews(newsData);
        setCrypto(cryptoData);

        if (!selectedStock && stockData.length > 0) {
          setSelectedStock(stockData[0]);
        }
      } catch (err) {
        console.error("Refresh error:", err);
        setError("Failed to fetch market data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce API call by 300ms
  }, [selectedStock]);

  const selectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    // Find the stock from the current list or fetch if not present
    let stock = stocks.find((s) => s.symbol === symbol);
    // TODO: If stock is not found, consider fetching it specifically
    if (stock) setSelectedStock(stock);
  };

  const getCandlestickData = useCallback(
    async (
      symbol: string,
      range: string = "1mo",
      interval: string = "1d"
    ): Promise<CandlestickData[]> => {
      const cacheKey = `${symbol}_${range}_${interval}`;

      if (candlestickCache.current.has(cacheKey)) {
        const cached = candlestickCache.current.get(cacheKey)!;
        setCandlestickData(cached);
        return cached;
      }

      setCandlestickLoading(true);

      try {
        const { chartData } = await stockApi.getFullChartData(symbol, range, interval);
        candlestickCache.current.set(cacheKey, chartData);
        setCandlestickData(chartData);
        return chartData;
      } catch (err) {
        console.error("Error fetching candlestick data:", err);
        setError("Failed to load chart data.");
        throw err;
      } finally {
        setCandlestickLoading(false);
      }
    },
    []
  );

  const getQuote = async (symbol: string): Promise<StockQuote | null> => {
    try {
      return await stockApi.getStockQuote(symbol);
    } catch (err) {
      console.error(`Quote error (${symbol}):`, err);
      return null;
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);



  const value: MarketDataContextType = {
    selectedSymbol,
    stocks,
    news,
    crypto,
    candlestickData,
    technicalIndicators: [],
    selectedStock,
    isLoading,
    candlestickLoading,
    error,
    refreshData,
    selectStock,
    getCandlestickData,
    getQuote,
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

export function useMarketData(): MarketDataContextType {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error("useMarketData must be used within MarketDataProvider");
  }
  return context;
}
