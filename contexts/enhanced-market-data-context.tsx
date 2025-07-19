"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { stockAPI, StockQuote, ChartData } from "@/lib/api/stock-api";
import { newsAPI, NewsItem } from "@/lib/api/news-api";
import { cryptoAPI, CryptoQuote } from "@/lib/api/crypto-api";

// Type for technical indicators
export interface TechnicalIndicators {
  sma20?: number[];
  sma50?: number[];
  sma200?: number[];
  ema12?: number[];
  ema26?: number[];
  bollinger?: { upper: number[]; middle: number[]; lower: number[] };
  rsi?: number[];
  macd?: {
    line: any; macd: number[]; signal: number[]; histogram: number[] 
};
  stochastic?: { k: number[]; d: number[] };
  williams?: number[];
  atr?: number[];
  adx?: number[];
  bollingerBands: { upper: number[]; middle: number[]; lower: number[] };
  macdLine: number[];
  macdSignal: number[];
  macdHistogram: number[];
  stochK: number[];
  stochD: number[];
  williamsR: number[];
  atrIndicator: number[];
  adxIndicator: number[];
  sma20Indicator: number[];
  sma50Indicator: number[];
  sma200Indicator: number[];
  ema12Indicator: number[];
  ema26Indicator: number[];
  bollingerUpperIndicator: number[];
  bollingerMiddleIndicator: number[];
  bollingerLowerIndicator: number[];
  rsiIndicator: number[];
  macdLineIndicator: number[];
  macdSignalIndicator: number[];
  macdHistogramIndicator: number[];
  stochKIndicator: number[];
  stochDIndicator: number[];
  williamsRIndicator: number[];
  atrIndicatorIndicator: number[];
  adxIndicatorIndicator: number[];
  sma200IndicatorIndicator: number[];
  sma50IndicatorIndicator: number[];
  sma20IndicatorIndicator: number[];
  ema12IndicatorIndicator: number[];
  ema26IndicatorIndicator: number[];
}

// Context interface
interface MarketDataContextType {
  stocks: StockQuote[];
  news: NewsItem[];
  crypto: CryptoQuote[];
  technicalIndicators: TechnicalIndicators;
  candlestickData: ChartData[];
  selectedStock: StockQuote | null;
  isLoading: boolean;
  error: string | null;

  refreshData: () => void;
  selectStock: (symbol: string) => void;
  getCandlestickData: (symbol: string, timeframe: string) => Promise<ChartData[]>;
}

// Create context
const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

// Utility function
export const formatIndicatorData = (data: any) => {
  if (!data) return [];
  return Object.entries(data).map(([key, value]) => ({
    name: key,
    value: Array.isArray(value) ? value[value.length - 1] : value,
  }));
};

// Provider
export function MarketDataProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [crypto, setCrypto] = useState<CryptoQuote[]>([]);
  const [candlestickData, setCandlestickData] = useState<ChartData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch market data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stockData, newsData, cryptoData] = await Promise.all([
        stockAPI.getMultipleQuotes(["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN"]),
        newsAPI.getMarketNews("general"),
        cryptoAPI.getMultipleCryptoQuotes(["BTC", "ETH", "SOL", "ADA"]),
      ]);

      setStocks(stockData);
      setNews(newsData);
      setCrypto(cryptoData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch market data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Select a stock
  const selectStock = async (symbol: string) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (stock) {
      setSelectedStock(stock);
    }
  };

  // Get candlestick data
  const getCandlestickData = async (symbol: string, timeframe: string): Promise<ChartData[]> => {
    try {
      const chartData = await stockAPI.getChartData(symbol, timeframe);
      setCandlestickData(chartData);
      return chartData;
    } catch (err) {
      console.error("Failed to get chart data", err);
      return [];
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value: MarketDataContextType = {
    stocks,
    news,
    crypto,
    technicalIndicators: {} as TechnicalIndicators, // Initialize with an empty object
    candlestickData,
    selectedStock,
    isLoading,
    error,
    refreshData,
    selectStock,
    getCandlestickData,
  };

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
}

// Hook to use context
export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error("useMarketData must be used within a MarketDataProvider");
  }
  return context;
}
