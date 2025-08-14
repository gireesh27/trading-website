"use client";
import FooterTime from "./FooterTime";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cryptoApi } from "@/lib/api/crypto-api"; // ensure correct path
import type { CryptoData } from "@/types/crypto-types";
import { AuroraText } from "@/components/ui/AuoraText";
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
import { CandlestickPoint } from "@/components/advanced-trading-chart";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { useAuth } from "@/contexts/auth-context";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { InteractiveGridPattern } from "@/components/ui/InteractiveGridPattern";
import { cn } from "@/lib/utils/cn";
import { ShinyButton } from "@/components/ui/Shiny";
export interface CryptoQuote {
  symbol: string;
  sector?: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high?: number;
  low?: number;
  rank?: number; // ✅ Add this
  dominance?: number; // ✅ And this (if you use it)
}
const getCleanSymbol = (raw: string): string =>
  raw.replace("-USD", "").toUpperCase();

const normalizeToYahooSymbol = (clean: string): string => `${clean}-USD`;
export default function CryptoPage() {
  const { isLoading, error, refreshCrypto } = useMarketData();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "price" | "change" | "volume" | "marketCap"
  >("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [chartCandlestickData, setChartCandlestickData] = useState<
    CandlestickPoint[]
  >([]);
  const ITEMS_PER_PAGE = 12;
  const [overviewPage, setOverviewPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "table">("overview");
  const [allCryptoData, setAllCryptoData] = useState<CryptoData[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  const handleSelect = (crypto: CryptoData) => {
    const clean = getCleanSymbol(crypto.symbol);
    const normalized = normalizeToYahooSymbol(clean);

    console.log("🔁 Redirecting to:", `/crypto/${normalized}`); // ✅ check output

    router.push(`/crypto/${normalized}`);
  };

  const fetchCryptoData = useCallback(
    async (page: number, replace: boolean = false) => {
      setLoadingPage(true);
      if (replace) setFetchError(null);

      try {
        // Call your cached backend API route here
        const response = await fetch(`/api/crypto/quotes`);
        if (!response.ok) throw new Error("Failed to fetch crypto data");

        const quotes = await response.json();

        // Normalize data
        const normalized: CryptoData[] = quotes.map((q: any) => ({
          symbol: q.symbol,
          sector: "crypto",
          name: q.name,
          price: q.price,
          change: q.change,
          changePercent: q.changePercent,
          volume: q.volume,
          marketCap: q.marketCap ?? 0,
          high: q.high,
          low: q.low,
          rank: q.rank,
          dominance: q.dominance,
        }));

        if (normalized.length < ITEMS_PER_PAGE) {
          setHasMoreData(false);
        }

        setAllCryptoData((prev) => {
          if (replace) return normalized;

          const existingSymbols = new Set(prev.map((crypto) => crypto.symbol));
          const newData = normalized.filter(
            (crypto) => !existingSymbols.has(crypto.symbol)
          );
          return [...prev, ...newData];
        });
      } catch (error) {
        console.error("❌ Error in fetchCryptoData:", error);
        setFetchError("Failed to fetch crypto data. Please try again later.");
      } finally {
        setLoadingPage(false);
      }
    },
    []
  );

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
    refreshCrypto();
    fetchCryptoData(1, true);
  }, [refreshCrypto, fetchCryptoData]);

  //use Effect Hooks
  useEffect(() => {
    fetchCryptoData(1, true);
  }, [fetchCryptoData]);

  useEffect(() => {
    if (activeTab === "overview") {
      setOverviewPage(1);
    } else if (activeTab === "table") {
      setTablePage(1);
    }
  }, [searchTerm, sortBy, sortOrder, activeTab]);
  const { user, isLoading: authLoading } = useAuth();
  if (authLoading || !user) {
    return (
      <div className="bg-[#131722] flex flex-col items-center justify-center pt-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="text-white pt-20 relative min-h-screen bg-[#0e0f1a] flex items-center justify-center p-4 overflow-hidden">
      {/* Optional: Original background (blurred circles or gradient beams) */}
      <BackgroundBeamsWithCollision className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#1a1c2b]/90 via-[#2a2c3d]/70 to-[#1a1c2b]/90">
        <div className="w-96 h-96 bg-purple-500 opacity-30 blur-3xl rounded-full" />
        <div className="w-96 h-96 bg-blue-500 opacity-30 blur-2xl rounded-full" />

        <div className="w-96 h-96 bg-red-500 opacity-30 blur-2xl rounded-full" />
        <div className="w-96 h-96 bg-yellow-500 opacity-30 blur-3xl rounded-full" />
        <div className="w-96 h-96 bg-pink-500 opacity-30 blur-xl rounded-full" />
      </BackgroundBeamsWithCollision>

      {/* Interactive grid as subtle overlay */}
      <InteractiveGridPattern
        width={window.innerWidth / 20} // full screen width
        height={window.innerHeight / 10} // full screen height
        squares={[
          Math.ceil(window.innerWidth / 10),
          Math.ceil(window.innerHeight / 10),
        ]} // auto number of squares
        className="absolute inset-0 z-0 pointer-events-none"
        squaresClassName="bg-white/5"
      />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              <AuroraText>Cryptocurrency</AuroraText>
            </h1>
            <p className="text-gray-300">Live crypto prices and market data</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search crypto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/60"
              onClick={() => {
                const newOrder = sortOrder === "desc" ? "asc" : "desc";
                setSortOrder(newOrder);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Sort {sortOrder === "desc" ? "↓" : "↑"}
            </Button>
            <ShinyButton
              onClick={handleRefresh}
              disabled={loadingPage}
              className="bg-gradient-to-r from-pink-500 via-violet-500 to-orange-400 text-white font-semibold py-2 px-6 rounded-lg hover:brightness-110 transition-all duration-300"
            >
              {loadingPage ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </ShinyButton>
          </div>
        </div>

        {/* Market Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
          {[
            {
              title: "Total Market Cap",
              value: formatLargeNumber(marketStats.totalMarketCap),
              icon: <DollarSign className="h-8 w-8 text-blue-500" />,
              textClass: "text-white",
            },
            {
              title: "24h Volume",
              value: formatLargeNumber(marketStats.totalVolume),
              icon: <Activity className="h-8 w-8 text-purple-500" />,
              textClass: "text-white",
            },
            {
              title: "Gainers",
              value: <CountUp end={marketStats.gainers} duration={1.5} />,
              icon: <TrendingUp className="h-8 w-8 text-green-500" />,
              textClass: "text-green-500",
            },
            {
              title: "Losers",
              value: <CountUp end={marketStats.losers} duration={1.5} />,
              icon: <TrendingDown className="h-8 w-8 text-red-500" />,
              textClass: "text-red-500",
            },
          ].map((stat) => (
            <Card
              key={stat.title}
              className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 hover:bg-gray-900/80 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">{stat.title}</p>
                    <p className={`text-lg font-semibold ${stat.textClass}`}>
                      {stat.value}
                    </p>
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "overview" | "table")}
        >
          <TabsList className="relative z-10 inline-flex space-x-2 bg-gray-900/80 border border-gray-700 rounded-md p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r from-pink-400 via-violet-500 to-orange-400 data-[state=active]:text-white rounded-md px-4 py-2 text-gray-300 font-semibold hover:text-white transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="data-[state=active]:bg-gradient-to-r from-pink-400 via-violet-500 to-orange-400 data-[state=active]:text-white rounded-md px-4 py-2 text-gray-300 font-semibold hover:text-white transition-colors"
            >
              Table View
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <Card className="relative bg-gray-800 border-gray-700 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between relative z-10">
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

              <CardContent className="relative z-10">
                {isLoading && allCryptoData.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-700 h-40 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : error || fetchError ? (
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
                          className="bg-gray-900 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer relative"
                          onClick={() => handleSelect(crypto)}
                        >
                          {/* Dot Background */}
                          <div
                            className={cn(
                              "absolute inset-0",
                              "[background-size:20px_20px]",
                              "[background-image:radial-gradient(#404040_1px,transparent_1px)]",
                              "dark:[background-image:radial-gradient(#606060_1px,transparent_1px)]",
                              "pointer-events-none"
                            )}
                          />
                          {/* Crypto Content */}
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
            <Card className="relative bg-gray-800 border-gray-700 overflow-hidden">
              {/* Dot Background */}
              <div
                className={cn(
                  "absolute inset-0",
                  "[background-size:20px_20px]",
                  "[background-image:radial-gradient(#404040_1px,transparent_1px)]",
                  "dark:[background-image:radial-gradient(#606060_1px,transparent_1px)]",
                  "pointer-events-none"
                )}
              />

              <CardHeader className="relative z-10">
                <CardTitle className="text-white">
                  Cryptocurrency Table
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10">
                {error || fetchError ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-4">{fetchError || error}</p>
                    <Button onClick={handleRefresh}>Retry</Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto bg-gray-900/80 p-4 rounded-md border border-gray-700">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-400">
                              #
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
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading && allCryptoData.length === 0
                            ? [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-800 animate-pulse"
                                >
                                  {[...Array(6)].map((_, idx) => (
                                    <td key={idx} className="py-4 px-4">
                                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                                    </td>
                                  ))}
                                </tr>
                              ))
                            : tableData.length > 0
                            ? tableData.map((crypto) => (
                                <tr
                                  key={`${crypto.symbol}-${
                                    crypto.rank || crypto.name
                                  }`}
                                  className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                                  onClick={() => handleSelect(crypto)}
                                >
                                  <td className="py-3 px-4 text-gray-400">
                                    {crypto.rank}
                                  </td>
                                  <td className="py-3 px-4 text-white font-semibold">
                                    {crypto.name}
                                    <span className="block text-xs text-gray-400">
                                      {crypto.symbol}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right text-white">
                                    $
                                    {crypto.price.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits:
                                        crypto.price < 1 ? 6 : 2,
                                    })}
                                  </td>
                                  <td
                                    className={`py-3 px-4 text-right font-medium ${
                                      crypto.changePercent >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {crypto.changePercent >= 0 ? "+" : ""}
                                    {crypto.changePercent.toFixed(2)}%
                                  </td>
                                  <td className="py-3 px-4 text-right text-white">
                                    {formatLargeNumber(crypto.volume)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-white">
                                    {formatLargeNumber(crypto.marketCap)}
                                  </td>
                                </tr>
                              ))
                            : null}
                        </tbody>
                      </table>
                    </div>

                    {!loadingPage && tableData.length === 0 && !fetchError && (
                      <div className="text-center py-8 text-gray-400">
                        No cryptocurrencies found.
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
          <div className="flex justify-center items-center mt-6 space-x-4 relative z-10">
            <Button
              variant="outline"
              onClick={() => handleOverviewPageChange(overviewPage - 1)}
              disabled={overviewPage === 1 || loadingPage}
              className="border-gray-600 bg-gray-900/70 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-300 rounded-lg backdrop-blur-sm"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-300 px-3 py-1 rounded-md bg-gray-900/50 backdrop-blur-sm border border-gray-700 shadow-sm">
              Page {overviewPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => handleOverviewPageChange(overviewPage + 1)}
              disabled={overviewPage >= totalPages || loadingPage}
              className="border-gray-600 bg-gray-900/70 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-300 rounded-lg backdrop-blur-sm"
            >
              Next
            </Button>
          </div>
        )}

        {/* Table Load More */}
        {activeTab === "table" && canLoadMoreTable && !fetchError && (
          <div className="flex justify-center mt-6 relative z-10">
            <Button
              variant="default"
              onClick={handleTableLoadMore}
              disabled={loadingPage}
              className="bg-gradient-to-r from-pink-500 via-violet-500 to-orange-400 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:opacity-90 transition-all duration-300"
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

        <FooterTime />
      </div>
    </div>
  );
}
