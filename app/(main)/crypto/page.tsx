"use client";
import { MainNav } from "@/components/main-nav";
import FooterTime from "./FooterTime";
import {
  useMarketData,
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
import { useState, useEffect, useCallback } from "react";
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
    // `stocks` is removed as it was unused
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

  const ITEMS_PER_PAGE = 12;
  const [overviewPage, setOverviewPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "table">("overview");

  const [allCryptoData, setAllCryptoData] = useState<CryptoData[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  // New state for handling fetch-specific errors
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCryptoData = useCallback(
    async (page: number, replace: boolean = false) => {
      setLoadingPage(true);
      if (replace) {
        setFetchError(null); // Clear previous errors on a fresh load
      }
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&price_change_percentage=24h`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch crypto data");
        }

        const data = await response.json();
        
        if (data.length < ITEMS_PER_PAGE) {
          setHasMoreData(false);
        }

        const mapped: CryptoData[] = data.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change: coin.price_change_24h,
          changePercent: coin.price_change_percentage_24h,
          volume: coin.total_volume,
          marketCap: coin.market_cap,
          high: coin.high_24h,
          low: coin.low_24h,
          rank: coin.market_cap_rank,
        }));

        setAllCryptoData((prev) => {
          if (replace) {
            return mapped;
          } else {
            const existingSymbols = new Set(prev.map((crypto) => crypto.symbol));
            const newData = mapped.filter(
              (crypto) => !existingSymbols.has(crypto.symbol)
            );
            return [...prev, ...newData];
          }
        });
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        // Set the specific error message for the UI
        setFetchError("Failed to fetch crypto data. Please try again later.");
      } finally {
        setLoadingPage(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCryptoData(1, true);
  }, [fetchCryptoData]);

  // New useEffect to reset pagination when search or sort changes
  useEffect(() => {
    setOverviewPage(1);
    setTablePage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const handleOverviewPageChange = useCallback(
    (newPage: number) => {
      setOverviewPage(newPage);
      const requiredDataLength = newPage * ITEMS_PER_PAGE;
      if (allCryptoData.length < requiredDataLength && hasMoreData) {
        const pagesToFetch = Math.ceil(
          (requiredDataLength - allCryptoData.length) / ITEMS_PER_PAGE
        );
        const startPage = Math.ceil(allCryptoData.length / ITEMS_PER_PAGE) + 1;
        for (let i = 0; i < pagesToFetch; i++) {
          fetchCryptoData(startPage + i, false);
        }
      }
    },
    [allCryptoData.length, hasMoreData, fetchCryptoData]
  );

  const handleTableLoadMore = useCallback(() => {
    const nextPage = Math.ceil(allCryptoData.length / ITEMS_PER_PAGE) + 1;
    setTablePage((prev) => prev + 1);
    fetchCryptoData(nextPage, false);
  }, [allCryptoData.length, fetchCryptoData]);
  
  const filteredAndSortedData = allCryptoData
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

  const overviewData = filteredAndSortedData.slice(
    (overviewPage - 1) * ITEMS_PER_PAGE,
    overviewPage * ITEMS_PER_PAGE
  );

  const tableData = filteredAndSortedData.slice(0, tablePage * ITEMS_PER_PAGE);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const canLoadMoreTable =
    tablePage * ITEMS_PER_PAGE < filteredAndSortedData.length || hasMoreData;

  const marketStats = {
    totalMarketCap: allCryptoData.reduce(
      (sum, crypto) => sum + (crypto.marketCap || 0),
      0
    ),
    totalVolume: allCryptoData.reduce((sum, crypto) => sum + crypto.volume, 0),
    gainers: allCryptoData.filter((crypto) => crypto.changePercent > 0).length,
    losers: allCryptoData.filter((crypto) => crypto.changePercent < 0).length,
  };

  const formatLargeNumber = (num: number | null | undefined): string => {
    if (!num || isNaN(num)) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const handleRefresh = useCallback(() => {
    setFetchError(null); // Clear errors on refresh
    setAllCryptoData([]);
    setOverviewPage(1);
    setTablePage(1);
    setHasMoreData(true);
    refreshData();
    fetchCryptoData(1, true);
  }, [refreshData, fetchCryptoData]);

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
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loadingPage}
            >
              {loadingPage ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
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
                  </p>
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
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "overview" | "table")}
        >
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
                {isLoading && allCryptoData.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-700 h-40 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (error || fetchError) ? ( // Check both context error and fetchError
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-4">{fetchError || error}</p>
                    <Button onClick={handleRefresh}>Retry</Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {overviewData.map((crypto) => (
                        <div
                         key={`${crypto.symbol}-${crypto.rank || crypto.name}`}
                          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                          onClick={() => selectStock(crypto.symbol + "-USD")}
                        >
                           <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-white font-semibold">
                                {crypto.name} ({crypto.symbol})
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
                            <div className="flex items-center justify-between mt-2">
                            <span className="text-white text-lg font-bold">
                                $
                                {crypto.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: crypto.price < 1 ? 6 : 2,
                                })}
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
                    {!loadingPage && overviewData.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">
                          No cryptocurrencies found matching your search.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {loadingPage && allCryptoData.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
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
                {(error || fetchError) ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-4">{fetchError || error}</p>
                    <Button onClick={handleRefresh}>Retry</Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-400">#</th>
                            <th className="text-left py-3 px-4 text-gray-400">Name</th>
                            <th className="text-right py-3 px-4 text-gray-400">Price</th>
                            <th className="text-right py-3 px-4 text-gray-400">24h Change</th>
                            <th className="text-right py-3 px-4 text-gray-400">Volume</th>
                            <th className="text-right py-3 px-4 text-gray-400">Market Cap</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading && allCryptoData.length === 0 ? (
                            [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                              <tr key={i} className="border-b border-gray-800 animate-pulse">
                                <td className="py-4 px-4"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                                <td className="py-4 px-4"><div className="h-4 bg-gray-700 rounded"></div></td>
                                <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-700 rounded w-3/4 ml-auto"></div></td>
                                <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
                                <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-700 rounded w-3/4 ml-auto"></div></td>
                                <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-700 rounded w-3/4 ml-auto"></div></td>
                              </tr>
                            ))
                          ) : tableData.length > 0 ? (
                            tableData.map((crypto) => (
                              <tr
                                key={`${crypto.symbol}-${crypto.rank || crypto.name}`}
                                className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                                onClick={() => selectStock(crypto.symbol + "-USD")}
                              >
                                <td className="py-3 px-4 text-gray-400">{crypto.rank}</td>
                                <td className="py-3 px-4 text-white font-semibold">
                                  {crypto.name}
                                  <span className="block text-xs text-gray-400">{crypto.symbol}</span>
                                </td>
                                <td className="py-3 px-4 text-right text-white">${crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: crypto.price < 1 ? 6 : 2})}</td>
                                <td className={`py-3 px-4 text-right font-medium ${crypto.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                  {crypto.changePercent >= 0 ? "+" : ""}{crypto.changePercent.toFixed(2)}%
                                </td>
                                <td className="py-3 px-4 text-right text-white">{formatLargeNumber(crypto.volume)}</td>
                                <td className="py-3 px-4 text-right text-white">{formatLargeNumber(crypto.marketCap)}</td>
                              </tr>
                            ))
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                    {!loadingPage && tableData.length === 0 && !fetchError && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No cryptocurrencies found.</p>
                      </div>
                    )}
                    {loadingPage && allCryptoData.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Overview Pagination */}
        {activeTab === "overview" && !fetchError && (
          <div className="flex justify-center items-center mt-6 space-x-4 text-white">
            <Button
              variant="outline"
              onClick={() => handleOverviewPageChange(overviewPage - 1)}
              disabled={overviewPage === 1 || loadingPage}
              className="border-gray-700 text-gray-300 bg-transparent hover:bg-gray-700"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-400">Page {overviewPage} of {totalPages || 1}</span>
            <Button
              variant="outline"
              onClick={() => handleOverviewPageChange(overviewPage + 1)}
              disabled={overviewPage >= totalPages || loadingPage}
              className="border-gray-700 text-gray-300 bg-transparent hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        )}

        {/* Table Load More */}
        {activeTab === "table" && canLoadMoreTable && !fetchError &&(
          <div className="flex justify-center mt-6">
            <Button
              variant="default"
              onClick={handleTableLoadMore}
              disabled={loadingPage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loadingPage ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}

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
                        {technicalIndicators.macd?.line?.[
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