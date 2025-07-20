"use client";
import { MainNav } from "@/components/main-nav";
import { MarketTicker } from "@/components/market-ticker";
import FooterTime from "./FooterTime";
import {
  useMarketData,
  formatIndicatorData,
  MarketDataProvider,
} from "@/contexts/enhanced-market-data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";

// Crypto symbols to track
const CRYPTO_SYMBOLS = [
  "BTC-USD",
  "ETH-USD",
  "BNB-USD",
  "XRP-USD",
  "ADA-USD",
  "SOL-USD",
  "DOGE-USD",
  "DOT-USD",
  "AVAX-USD",
  "MATIC-USD",
  "LINK-USD",
  "UNI-USD",
];
import CountUp from "react-countup";

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  change24h?: number;
  volume: number;
  marketCap: number; 
  high: number;
  low: number;
  rank?: number;
  dominance?: number;
}

export default function CryptoPage() {
  const {
    stocks,
    selectedStock,
    candlestickData,
    technicalIndicators,
    isLoading,
    error,
    selectStock,
    getCandlestickData,
    refreshData,
  } = useMarketData();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "price" | "change" | "volume" | "marketCap"
  >("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch crypto data
  // Update the fetchCryptoData function
  const fetchCryptoData = async () => {
    try {
      const cryptoPromises = CRYPTO_SYMBOLS.map(
        async (symbol): Promise<CryptoData | null> => {
          try {
            const response = await fetch(`/api/market/lookup?symbol=${symbol}`);
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const result = data.chart?.result?.[0];
            if (!result) return null;

            const meta = result.meta;
            const quote = result.indicators?.quote?.[0];
            const timestamps = result.timestamp;

            if (
              !quote ||
              !Array.isArray(timestamps) ||
              timestamps.length === 0 ||
              !quote.close?.length
            ) {
              return null;
            }

            const latestIndex = timestamps.length - 1;
            const previousIndex = Math.max(0, latestIndex - 1);

            const currentPrice = parseFloat(
              (
                quote.close[latestIndex] ??
                meta.regularMarketPrice ??
                0
              ).toFixed(2)
            );
            const previousClose = parseFloat(
              (
                quote.close[previousIndex] ??
                meta.previousClose ??
                currentPrice
              ).toFixed(2)
            );
            const change = parseFloat(
              (currentPrice - previousClose).toFixed(2)
            );
            const changePercent = parseFloat(
              ((change / previousClose) * 100).toFixed(2)
            );

            // Calculate 24h change using 24th previous candle if available
            const change24h =
              latestIndex >= 24 && quote.close?.[latestIndex - 24] != null
                ? parseFloat(
                    (
                      quote.close[latestIndex] - quote.close[latestIndex - 24]
                    ).toFixed(2)
                  )
                : 0;

            const volume = quote.volume?.[latestIndex] ?? 0;
            const marketCap =
              meta.marketCap ??
              (volume && currentPrice ? volume * currentPrice : null);

            return {
              symbol: symbol.replace("-USD", ""),
              name:
                meta.longName || meta.shortName || symbol.replace("-USD", ""),
              price: currentPrice,
              change,
              changePercent,
              change24h,
              volume,
              marketCap,
              high:
                meta.regularMarketDayHigh ??
                quote.high?.[latestIndex] ??
                currentPrice,
              low:
                meta.regularMarketDayLow ??
                quote.low?.[latestIndex] ??
                currentPrice,
              rank: getCryptoRank(symbol),
            };
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
          }
        }
      );

      const results = await Promise.allSettled(cryptoPromises);

      const validCrypto = results
        .filter(
          (result): result is PromiseFulfilledResult<CryptoData | null> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value)
        .filter((crypto): crypto is CryptoData => crypto !== null);

      const totalMarketCap = validCrypto.reduce(
        (sum, c) => sum + (c.marketCap || 0),
        0
      );

      const cryptoWithDominance = validCrypto.map((crypto) => ({
        ...crypto,
        dominance: crypto.marketCap
          ? parseFloat(((crypto.marketCap / totalMarketCap) * 100).toFixed(2))
          : 0,
      }));

      setCryptoData(cryptoWithDominance);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
  };

  // Get crypto rank (simplified)
  const getCryptoRank = (symbol: string): number => {
    const ranks: { [key: string]: number } = {
      "BTC-USD": 1,
      "ETH-USD": 2,
      "BNB-USD": 3,
      "XRP-USD": 4,
      "ADA-USD": 5,
      "SOL-USD": 6,
      "DOGE-USD": 7,
      "DOT-USD": 8,
      "AVAX-USD": 9,
      "MATIC-USD": 10,
      "LINK-USD": 11,
      "UNI-USD": 12,
    };
    return ranks[symbol] || 999;
  };

  // Filter and sort crypto data
  const filteredAndSortedData = cryptoData
    .filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

  // Calculate market stats
  const marketStats = {
    totalMarketCap: cryptoData.reduce(
      (sum, crypto) => sum + (crypto.marketCap || 0),
      0
    ),
    totalVolume: cryptoData.reduce((sum, crypto) => sum + crypto.volume, 0),
    gainers: cryptoData.filter((crypto) => crypto.changePercent > 0).length,
    losers: cryptoData.filter((crypto) => crypto.changePercent < 0).length,
  };

  // Format large numbers
  const formatLargeNumber = (num: number | null | undefined): string => {
    if (!num || isNaN(num)) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  useEffect(() => {
    fetchCryptoData();

    // Refresh crypto data every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#131722]">
      <MainNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Cryptocurrency
            </h1>
            <p className="text-gray-400">Live crypto prices and market data</p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search crypto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 bg-transparent"
              onClick={() => {
                const newOrder = sortOrder === "desc" ? "asc" : "desc";
                setSortOrder(newOrder);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Sort {sortOrder === "desc" ? "↓" : "↑"}
            </Button>

            <Button
              onClick={() => {
                refreshData();
                fetchCryptoData();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Market Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Market Cap</p>
                  <p className="text-white text-lg font-semibold">
                    {formatLargeNumber(marketStats.totalMarketCap)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">24h Volume</p>
                  <p className="text-white text-lg font-semibold">
                    {formatLargeNumber(marketStats.totalVolume)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Gainers</p>
                  <p className="text-green-500 text-lg font-semibold">
                    <CountUp end={marketStats.gainers} duration={1.5} />
                  </p>{" "}
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Losers</p>
                  <p className="text-red-500 text-lg font-semibold">
                    <CountUp end={marketStats.losers} duration={1.5} />
                  </p>{" "}
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gray-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="data-[state=active]:bg-gray-700"
            >
              Table View
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">
                  Cryptocurrency Markets
                </CardTitle>
                <div className="flex space-x-2">
                  {["price", "change", "volume", "marketCap"].map((sort) => (
                    <Button
                      key={sort}
                      variant={sortBy === sort ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(sort as any)}
                      className="text-xs"
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-700 h-24 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button
                      onClick={() => {
                        refreshData();
                        fetchCryptoData();
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedData.map((crypto) => (
                      <div
                        key={crypto.symbol}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => selectStock(crypto.symbol + "-USD")}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold">
                              {crypto.symbol}
                            </h3>
                            {crypto.rank && crypto.rank <= 10 && (
                              <Badge variant="secondary" className="text-xs">
                                #{crypto.rank}
                              </Badge>
                            )}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              crypto.changePercent >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {crypto.changePercent >= 0 ? "+" : ""}
                            {crypto.changePercent.toFixed(2)}%
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-2">
                          {crypto.name}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-white text-lg font-bold">
                            $
                            {crypto.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: crypto.price < 1 ? 6 : 2,
                            })}
                          </span>
                          <span
                            className={`text-sm ${
                              crypto.change >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {crypto.change >= 0 ? "+" : ""}$
                            {crypto.change.toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
                          <div>
                            <span className="block">Volume</span>
                            <span className="text-white">
                              {formatLargeNumber(crypto.volume)}
                            </span>
                          </div>
                          <div>
                            <span className="block">Market Cap</span>
                            <span className="text-white">
                              {crypto.marketCap
                                ? formatLargeNumber(crypto.marketCap)
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
                          <div>
                            <span className="block">24h High</span>
                            <span className="text-green-400">
                              ${crypto.high.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="block">24h Low</span>
                            <span className="text-red-400">
                              ${crypto.low.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && !error && filteredAndSortedData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No cryptocurrencies found matching your search.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TABLE TAB */}
          <TabsContent value="table">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Cryptocurrency Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400">
                          Rank
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400">
                          Name
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          Price
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          24h Change
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          Volume
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          Market Cap
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          24h High
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          24h Low
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedData.map((crypto, index) => (
                        <tr
                          key={crypto.symbol}
                          className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => selectStock(crypto.symbol + "-USD")}
                        >
                          <td className="py-3 px-4 text-gray-400">
                            #{crypto.rank || index + 1}
                          </td>
                          <td className="py-3 px-4 text-white font-semibold">
                            {crypto.symbol}{" "}
                            <span className="block text-xs text-gray-400">
                              {crypto.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            ${crypto.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-medium ${
                                crypto.changePercent >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {crypto.changePercent >= 0 ? "+" : ""}
                              {crypto.changePercent.toFixed(2)}%
                            </span>
                            <br />
                            <span
                              className={`text-sm ${
                                crypto.change >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {crypto.change >= 0 ? "+" : ""}$
                              {crypto.change.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            {formatLargeNumber(crypto.volume)}
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            {crypto.marketCap
                              ? formatLargeNumber(crypto.marketCap)
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-right text-green-400">
                            ${crypto.high.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-red-400">
                            ${crypto.low.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!isLoading &&
                    !error &&
                    filteredAndSortedData.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">
                          No cryptocurrencies found.
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Crypto Details */}
        {selectedStock && selectedStock.symbol.includes("-USD") && (
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>
                  {selectedStock.name} ({selectedStock.symbol})
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold">
                    ${selectedStock.price.toLocaleString()}
                  </span>
                  <span
                    className={`text-lg font-medium ${
                      selectedStock.changePercent >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedStock.changePercent >= 0 ? "+" : ""}
                    {selectedStock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">24h Change</p>
                  <p
                    className={`text-lg font-semibold ${
                      selectedStock.change >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedStock.change >= 0 ? "+" : ""}$
                    {selectedStock.change.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Volume</p>
                  <p className="text-white text-lg font-semibold">
                    {formatLargeNumber(selectedStock.volume)}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">24h High</p>
                  <p className="text-green-400 text-lg font-semibold">
                    ${selectedStock.high.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">24h Low</p>
                  <p className="text-red-400 text-lg font-semibold">
                    ${selectedStock.low.toFixed(2)}
                  </p>
                </div>
              </div>

              {candlestickData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Price Chart
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-gray-400">
                      Chart visualization would go here
                      <br />
                      <span className="text-sm">
                        Data points: {candlestickData.length} | Latest: $
                        {candlestickData[
                          candlestickData.length - 1
                        ]?.close.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {technicalIndicators && (
                <div className="mt-6">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Technical Indicators
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">RSI</p>
                      <p className="text-white font-semibold">
                        {technicalIndicators.rsi?.[
                          technicalIndicators.rsi.length - 1
                        ]?.toFixed(2) ?? "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">SMA (20)</p>
                      <p className="text-white font-semibold">
                        $
                        {technicalIndicators.sma20?.[
                          technicalIndicators.sma20.length - 1
                        ]?.toFixed(2) ?? "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">EMA (12)</p>
                      <p className="text-white font-semibold">
                        $
                        {technicalIndicators.ema12?.[
                          technicalIndicators.ema12.length - 1
                        ]?.toFixed(2) ?? "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">MACD</p>
                      <p className="text-white font-semibold">
                        {technicalIndicators.macd?.macd?.[
                          technicalIndicators.macd.line.length - 1
                        ]?.toFixed(4) ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <FooterTime />
      </div>
    </div>
  );
}
