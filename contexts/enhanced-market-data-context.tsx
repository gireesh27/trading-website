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
  getFinancialsReported: (symbol: string) => Promise<FinancialReport[]>;
  stockPage: number;
  setStockPage: React.Dispatch<React.SetStateAction<number>>;
  refreshCrypto: () => void;
   loadMoreStocks: () => Promise<StockQuote[]> 
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
  const ITEMS_PER_PAGE = 9;

  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const candlestickCache = useRef<Map<string, CandlestickData[]>>(new Map());
  const trackedSymbols = [
    "AAPL",
    "GOOGL",
    "MSFT",
    "TSLA",
    "NVDA",
    "AMZN",
    "META",
    "NFLX",
    "BABA",
    "JPM",
    "V",
    "MA",
    "DIS",
    "ADBE",
    "CRM",
    "PYPL",
    "INTC",
    "CSCO",
    "ORCL",
    "KO",
    "PEP",
    "NKE",
    "WMT",
    "MCD",
    "BA",
    "UNH",
    "XOM",
    "CVX",
    "ABBV",
    "PFE",
    "T",
    "VZ",
    "IBM",
    "AMD",
    "QCOM",
    "GE",
    "GS",
    "MS",
    "C",
    "PLTR",
    "SNAP",
    "UBER",
    "LYFT",
    "SHOP",
    "ROKU",
    "TWLO",
    "SQ",
    "ZM",
    "DOCU",
    "ROKU",
    "FDX",
    "UPS",
    "SBUX",
    "BIDU",
    "LULU",
    "SPOT",
    "TGT",
    "COST",
    "WBA",
    "CVS",
    "EXPE",
    "BKNG",
    "DAL",
    "UAL",
    "MAR",
    "HLT",
    "NCLH",
    "RCL",
    "CCL",
    "EA",
    "ATVI",
    "TTWO",
    "SIRI",
    "TMUS",
    "CHTR",
    "DASH",
    "ABNB",
    "AI",
    "NVAX",
    "MRNA",
  ];

const refreshData = useCallback(
  ({ stockPage = 1, ITEMS_PER_PAGE = 9 }: RefreshDataArgs = {}) => {
    if (refreshTimeout.current) clearTimeout(refreshTimeout.current);

    refreshTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const startIdx = (stockPage - 1) * ITEMS_PER_PAGE;
        const endIdx = startIdx + ITEMS_PER_PAGE;
        const paginatedSymbols = trackedSymbols.slice(startIdx, endIdx);

        const [stockData, newsData] = await Promise.all([
          stockApi.getMultipleQuotes(paginatedSymbols),
          newsAPI.getMarketNews("general"),
        ]);

        setStocks(stockData);
        setNews(newsData);
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

  // Optional: Separate crypto loader
  const refreshCrypto = async () => {
    try {
      const cryptoData = await cryptoApi.getMultipleCryptoQuotes();
      setCrypto(cryptoData);
    } catch (err) {
      console.error("Crypto fetch error:", err);
      setError("Failed to fetch crypto data.");
    }
  };

const loadMoreStocks = async (): Promise<StockQuote[]> => {
  const nextPage = stockPage + 1;
  const start = nextPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const newSymbols = trackedSymbols.slice(start, end);

  try {
    const newStocks = await stockApi.getMultipleQuotes(newSymbols);
    setStocks((prev) => [...prev, ...newStocks]);
    setStockPage(nextPage);
    return newStocks; // ✅ RETURN for further use
  } catch (err) {
    console.error("Failed to load more stocks:", err);
    setError("Failed to load more stocks.");
    return []; // Return empty array on failure
  }
};

  const getFinancialsReported = async (
    symbol: string
  ): Promise<FinancialReport[]> => {
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
        const { chartData } = await stockApi.getFullChartData(
          symbol,
          range,
          interval
        );
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
    refreshCrypto,
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
