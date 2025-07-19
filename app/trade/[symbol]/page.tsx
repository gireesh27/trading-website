"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { AdvancedChart } from "@/components/advanced-chart";
import { OrderBook } from "@/components/order-book";
import { EnhancedTradingInterface } from "@/components/enhanced-trading-interface";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrading } from "@/contexts/trading-context";
import { Stock } from "@/types/trading-types"; // Assuming Stock type is defined here
import { AdvancedTradingChart } from "@/components/advanced-trading-chart";
import {
  ArrowLeft,
  Star,
  Share2,
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// Define a type for the stock data for better type safety
interface OrderBookProps {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}
interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  symbol: string;
}
interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap?: number;
  pe?: number;
}

export default function EnhancedTradePage() {
  const params = useParams();
  const symbol = typeof params.symbol === "string" ? params.symbol : "";
  const {
    stocks: marketData,
    candlestickData: chartData,
    getCandlestickData: getStockChart,
    selectStock,
    news,
  } = useMarketData();
  const { bids, asks } = useTrading();

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [liveChartData, setLiveChartData] = useState<any[]>([]);
  const [currentTimeframe, setCurrentTimeframe] = useState("5min");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (symbol && marketData.length > 0) {
      const stock = marketData.find(
        (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
      );
      if (stock) {
        setStockData(stock as StockData);
        selectStock(stock.symbol);
        loadChartData(stock.symbol, currentTimeframe);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [symbol, marketData, selectStock, currentTimeframe]);

  useEffect(() => {
    if (chartData.length > 0) {
      setLiveChartData(chartData);
    }
  }, [chartData]);

  const loadChartData = async (stockSymbol: string, interval: string) => {
    const data = await getStockChart(stockSymbol, interval);
    setLiveChartData(data);
  };

  const handleTimeframeChange = (interval: string) => {
    setCurrentTimeframe(interval);
    if (stockData) {
      loadChartData(stockData.symbol, interval);
    }
  };

  const toggleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
    // In a real app, you would save this preference to a backend or context
  };

  const shareStock = async () => {
    if (navigator.share && stockData) {
      try {
        await navigator.share({
          title: `${stockData.name} (${stockData.symbol})`,
          text: `Check out ${
            stockData.name
          } trading at $${stockData.price.toFixed(2)}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Share failed:", error);
        // Fallback to clipboard for browsers that don't support share API
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  // Moved relatedNews calculation inside the component return, after the loading check
  // This ensures stockData is not null when this is calculated.
  const relatedNews = stockData
    ? news
        .filter(
          (item) =>
            item &&
            item.title &&
            stockData.name &&
            stockData.symbol &&
            (item.title.toLowerCase().includes(stockData.name.toLowerCase()) ||
              item.title.toLowerCase().includes(stockData.symbol.toLowerCase()))
        )
        .slice(0, 3)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center">
        <MainNav />
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white">
            Loading Stock Data...
          </h1>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="min-h-screen bg-[#131722]">
        <MainNav />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Stock Not Found
            </h1>
            <p className="text-gray-400 mb-4">
              The symbol "{symbol.toUpperCase()}" could not be found.
            </p>
            <Link href="/markets">
              <Button>Back to Markets</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131722]">
      <MainNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">
                  {stockData.name}
                </h1>
                <Badge
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  {stockData.symbol}
                </Badge>
              </div>
              <p className="text-gray-400">Real-time trading</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleWatchlist}
              className={`border-gray-600 hover:bg-gray-700 ${
                isWatchlisted
                  ? "bg-yellow-600 text-white"
                  : "text-gray-300 bg-transparent"
              }`}
            >
              <Star
                className={`h-4 w-4 mr-2 ${
                  isWatchlisted ? "fill-current text-yellow-400" : ""
                }`}
              />
              {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareStock}
              className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Price Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-xl font-bold text-white">
                    ${stockData.price.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`flex items-center ${
                    stockData.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stockData.change >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p
                className={`text-sm mt-1 ${
                  stockData.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stockData.change >= 0 ? "+" : ""}
                {stockData.change.toFixed(2)} (
                {stockData.changePercent.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Day High</p>
                  <p className="text-lg font-bold text-white">
                    ${stockData.high.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Day Low</p>
                  <p className="text-lg font-bold text-white">
                    ${stockData.low.toFixed(2)}
                  </p>
                </div>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Volume</p>
                  <p className="text-lg font-bold text-white">
                    {stockData.volume.toLocaleString()}
                  </p>
                </div>
                <Volume2 className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Chart - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <AdvancedTradingChart
              symbol={stockData.symbol}
              name={stockData.name}
              currentPrice={stockData.price}
              chartCandlestickData={[]} // This will be populated by the context
              selectedStock={stockData as any} // Cast to any to bypass type incompatibility
              selectStock={selectStock as any} // Cast to any to bypass type incompatibility
              addToWatchlist={() => {}} // Placeholder, implement if needed
              removeFromWatchlist={() => {}} // Placeholder, implement if needed
              activeWatchlist={[]} // Placeholder, populate from watchlist context // Removed duplicate 'selectedStock' and 'selectStock'
              getCandlestickData={getStockChart as any}
            />
          </div>

          {/* Trading Interface */}
          <div>
            <EnhancedTradingInterface
              symbol={stockData.symbol}
              name={stockData.name}
              currentPrice={stockData.price}
            />
          </div>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Book */}
          <div className="lg:col-span-1">
            {stockData?.symbol && bids && asks && (
              <OrderBook symbol={stockData.symbol} bids={bids} asks={asks} />
            )}
          </div>

          {/* Company Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white">
                  {stockData.marketCap
                    ? `$${(stockData.marketCap / 1e9).toFixed(2)}B`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">P/E Ratio</span>
                <span className="text-white">
                  {stockData.pe?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Open</span>
                <span className="text-white">${stockData.open.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Previous Close</span>
                <span className="text-white">
                  ${stockData.previousClose.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">52W Range</span>
                <span className="text-white">
                  ${(stockData.low * 0.8).toFixed(2)} - $
                  {(stockData.high * 1.2).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related News */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Related News</CardTitle>
            </CardHeader>
            <CardContent>
              {relatedNews.length > 0 ? (
                <div className="space-y-3">
                  {relatedNews.map((item) => {
                    // Provide a default for sentiment
                    const sentiment = item.sentiment || "neutral";
                    return (
                      <div key={item.id} className="p-3 bg-gray-700 rounded-lg">
                        <h4 className="text-white text-sm font-medium mb-1 line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                          {item.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {item.source}
                          </span>
                          <Badge
                            className={`text-xs ${
                              sentiment === "positive"
                                ? "bg-green-500/20 text-green-400"
                                : sentiment === "negative"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {sentiment}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  No recent news available for {stockData.symbol}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
