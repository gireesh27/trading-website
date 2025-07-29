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
  FinancialReport,
} from "@/lib/api/stock-api";
import { newsAPI, NewsItem } from "@/lib/api/news-api";
import { cryptoApi } from "@/lib/api/crypto-api";

import { CryptoData } from "@/types/crypto-types";

interface RefreshDataArgs {
  stockPage?: number;
  ITEMS_PER_PAGE?: number;
}

type RefreshDataFn = (args?: RefreshDataArgs) => void;

interface MarketDataContextType {
  stocks: StockQuote[];
  news: NewsItem[];
  technicalIndicators: any[];
  crypto: CryptoData[];
  candlestickData: CandlestickData[];
  selectedStock: StockQuote | null;
  isLoading: boolean;
  candlestickLoading: boolean;
  error: string | null;
  refreshData: RefreshDataFn;
  selectStock: (symbol: string) => void;
  getCandlestickData: (
    symbol: string,
    range?: string,
    interval?: string
  ) => Promise<CandlestickData[]>;
  getQuote: (symbol: string) => Promise<StockQuote | null>;
  selectedSymbol: string | null;
  loadMoreStocks: () => void;
  getFinancialsReported: (symbol: string) => Promise<FinancialReport[]>;
  stockPage: number;
  setStockPage: React.Dispatch<React.SetStateAction<number>>;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(
  undefined
);

export const MarketDataProvider = ({ children }: { children: ReactNode }) => {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [crypto, setCrypto] = useState<CryptoData[]>([]);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [candlestickLoading, setCandlestickLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const [stockPage, setStockPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const candlestickCache = useRef<Map<string, CandlestickData[]>>(new Map());

  const refreshData = useCallback(
    ({ stockPage = 1, ITEMS_PER_PAGE = 5 }: RefreshDataArgs = {}) => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);

      refreshTimeout.current = setTimeout(async () => {
        setIsLoading(true);
        setError(null);

        try {
          const [stockData, newsData, cryptoData] = await Promise.all([
            stockApi.getPaginatedQuotes(stockPage, ITEMS_PER_PAGE),
            newsAPI.getMarketNews("general"),
            cryptoApi.getMultipleCryptoQuotes(),
          ]);

          setStocks(stockData);
          setNews(newsData);
          setCrypto(cryptoData);
        } catch (err) {
          console.error("Refresh error:", err);
          setError("Failed to fetch market data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    []
  );

  const loadMoreStocks = async () => {
    const nextPage = stockPage + 1;
    try {
      const moreStocks = await stockApi.getPaginatedQuotes(nextPage, ITEMS_PER_PAGE);
      setStocks((prev) => [...prev, ...moreStocks]);
      setStockPage(nextPage);
    } catch (err) {
      console.error("Failed to load more stocks:", err);
      setError("Failed to load more stocks.");
    }
  };

  const getFinancialsReported = async (symbol: string): Promise<FinancialReport[]> => {
    try {
      return await stockApi.getFinancialsReported(symbol);
    } catch (err) {
      console.error(`Financials fetch error (${symbol}):`, err);
      return [];
    }
  };

  const selectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    const stock = stocks.find((s) => s.symbol === symbol);
    if (stock) setSelectedStock(stock);
  };

  const getCandlestickData = useCallback(
    async (
      symbol: string,
      range = "1mo",
      interval = "1d"
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
    refreshData({ stockPage, ITEMS_PER_PAGE });
  }, [refreshData, stockPage]);

  useEffect(() => {
    if (!selectedStock && stocks.length > 0) {
      setSelectedStock(stocks[0]);
      setSelectedSymbol(stocks[0].symbol);
    }
  }, [selectedStock, stocks]);

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
    loadMoreStocks,
    getFinancialsReported,
    stockPage,
    setStockPage,
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
