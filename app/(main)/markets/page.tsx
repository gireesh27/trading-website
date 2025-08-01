"use client";

import { useState, useMemo, useEffect } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FooterTime from "./FooterTime";
import { Search, RefreshCw } from "lucide-react";
import CountUp from "react-countup";
import { StockQuote } from "@/lib/api/stock-api";
import { OverviewCard } from "./OverViewCard";
import {
  TableCell,
  TableHead,
  TableRow,
  Table,
  TableBody,
  TableHeader,
  TableFooter,
} from "@/components/ui/table";

import { formatNumber, formatCurrency } from "@/lib/utils/market";
import { useSearchContext } from "@/contexts/Search-context";
import { SymbolSearchBar } from "./Input_autocomplete";
const ITEMS_PER_PAGE = 12;

export default function MarketsPage() {
  const { stocks, isLoading, error, refreshData, loadMoreStocks,selectStock } =
    useMarketData();
  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [overviewPage, setOverviewPage] = useState(1);
  const [tableStocks, setTableStocks] = useState<StockQuote[]>([]);
  const [overviewPagesData, setOverviewPagesData] = useState<
    Record<number, StockQuote[]>
  >({});

  // Initialize tableStocks and page 1 overview
  useEffect(() => {
    if (stocks.length > 0) {
      setTableStocks((prev) => {
        const existing = new Set(prev.map((s) => s.symbol));
        const newStocks = stocks.filter((s) => !existing.has(s.symbol));
        return [...prev, ...newStocks];
      });

      setOverviewPagesData((prev) => {
        if (!prev[1]) {
          return { ...prev, 1: stocks.slice(0, ITEMS_PER_PAGE) };
        }
        return prev;
      });
    }
  }, [stocks]);
  const handleRefresh = async () => {
    setOverviewPage(1);
    setOverviewPagesData({});
    setTableStocks([]);
    await refreshData({ stockPage: 1, ITEMS_PER_PAGE });
  };
  const filteredStocks = useMemo(() => {
    return tableStocks.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tableStocks, searchTerm]);

  const currentOverviewData = useMemo(() => {
    return overviewPagesData[overviewPage] || [];
  }, [overviewPagesData, overviewPage]);

  const marketStats = useMemo(() => {
    const totalMarketCap = tableStocks.reduce(
      (sum, s) => sum + (s.marketCap ?? 0),
      0
    );
    const totalVolume = tableStocks.reduce(
      (sum, s) => sum + (s.volume ?? 0),
      0
    );
    const gainers = tableStocks.filter((s) => s.changePercent > 0).length;
    const losers = tableStocks.filter((s) => s.changePercent < 0).length;

    return { totalMarketCap, totalVolume, gainers, losers };
  }, [tableStocks]);

  const formatLargeNumber = (num: number | undefined): string => {
    if (!num || isNaN(num)) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const handleLoadMoreTable = async () => {
    const newStocks = await loadMoreStocks();
    if (newStocks.length > 0) {
      setTableStocks((prev) => {
        const unique = new Map(
          [...prev, ...newStocks].map((s) => [s.symbol, s])
        );
        return Array.from(unique.values());
      });
    }
  };

  const handleNextOverview = async () => {
    const nextPage = overviewPage + 1;
    if (overviewPagesData[nextPage]) {
      setOverviewPage(nextPage);
      return;
    }

    const newStocks = await loadMoreStocks();
    if (newStocks?.length) {
      setOverviewPagesData((prev) => ({
        ...prev,
        [nextPage]: newStocks,
      }));
      setOverviewPage(nextPage);
    }
  };

  const handlePrevOverview = () => {
    if (overviewPage > 1) {
      setOverviewPage((prev) => prev - 1);
    }
  };
  const [sortBy, setSortBy] = useState<
    | "symbol"
    | "name"
    | "price"
    | "change"
    | "marketCap"
    | "volume"
    | "previousClose"
    | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };
  const sortedStocks = [...(stocks ?? [])].sort((a, b) => {
    if (!sortBy) return 0;
    const dir = sortDirection === "asc" ? 1 : -1;

    switch (sortBy) {
      case "symbol":
        return a.symbol.localeCompare(b.symbol) * dir;
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "price":
        return ((a.price ?? 0) - (b.price ?? 0)) * dir;
      case "change":
        return ((a.change ?? 0) - (b.change ?? 0)) * dir;
      case "marketCap":
        return ((a.marketCap ?? 0) - (b.marketCap ?? 0)) * dir;
      case "volume":
        return ((a.volume ?? 0) - (b.volume ?? 0)) * dir;
      case "previousClose":
        return ((a.previousClose ?? 0) - (b.previousClose ?? 0)) * dir;
      default:
        return 0;
    }
  });
  const { suggestions, handleSymbolChange } = useSearchContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSymbolChange("global", value); // "global" can be a general ID for non-watchlist cases
  };
  return (
    <div className="min-h-screen bg-[#131722] text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Stock Market</h1>
            <p className="text-gray-400">Live stock quotes and data</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <SymbolSearchBar
              onSelectSymbol={(symbol) => {
                selectStock(symbol);
                setSearchTerm(symbol);
              }}
            />
            <Button
              onClick={() => handleRefresh()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {["Market Cap", "Volume", "Gainers", "Losers"].map((label) => (
            <Card key={label} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <p className="text-gray-400 text-sm">Total {label}</p>
                <p
                  className={`text-lg font-semibold ${
                    label === "Gainers"
                      ? "text-green-500"
                      : label === "Losers"
                      ? "text-red-500"
                      : "text-white"
                  }`}
                >
                  {label === "Market Cap" ? (
                    formatLargeNumber(marketStats.totalMarketCap)
                  ) : label === "Volume" ? (
                    formatLargeNumber(marketStats.totalVolume)
                  ) : (
                    <CountUp
                      end={
                        label === "Gainers"
                          ? marketStats.gainers
                          : marketStats.losers
                      }
                      duration={1.5}
                    />
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800 border border-gray-700 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {isLoading && currentOverviewData.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 h-40 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  onClick={() => refreshData({ stockPage: 1, ITEMS_PER_PAGE })}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentOverviewData.map((stock) => (
                    <div
                      key={`${stock.symbol}-${stock.name}`}
                      className="bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <OverviewCard quote={stock} />
                      </CardContent>
                    </div>
                  ))}
                </div>

                {!isLoading && currentOverviewData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No stocks found matching your search.
                    </p>
                  </div>
                )}
              </>
            )}

            {isLoading && currentOverviewData.length > 0 && (
              <div className="flex justify-center mt-4">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mt-6">
              <Button
                onClick={handlePrevOverview}
                disabled={overviewPage <= 1}
                className="bg-gray-700 disabled:opacity-50"
              >
                ← Prev
              </Button>
              <div className="text-sm text-gray-300 font-medium">
                Page <span className="text-white">{overviewPage}</span>
              </div>
              <Button
                onClick={handleNextOverview}
                disabled={isLoading}
                className="bg-gray-700 disabled:opacity-50"
              >
                Next →
              </Button>
            </div>
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table">
            <div className="overflow-x-auto border border-gray-700 rounded-md">
              <Table className="text-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("symbol")}
                      className="cursor-pointer text-base font-semibold"
                    >
                      Symbol{" "}
                      {sortBy === "symbol" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("name")}
                      className="cursor-pointer text-base font-semibold"
                    >
                      Name{" "}
                      {sortBy === "name" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("price")}
                      className="cursor-pointer text-base font-semibold"
                    >
                      Price{" "}
                      {sortBy === "price" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("change")}
                      className="cursor-pointer text-base font-semibold"
                    >
                      Change{" "}
                      {sortBy === "change" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("marketCap")}
                      className="cursor-pointer text-base font-semibold"
                    >
                      Market Cap{" "}
                      {sortBy === "marketCap" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("volume")}
                      className="cursor-pointer text-base font-semibold"
                    >
                      Volume{" "}
                      {sortBy === "volume" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("previousClose")}
                      className="cursor-pointer text-base font-semibold"
                    >
                      Prev Close{" "}
                      {sortBy === "previousClose" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStocks.map((stock) => (
                    <TableRow key={stock.symbol} className="text-lg">
                      <TableCell className="font-bold">
                        {stock.symbol}
                      </TableCell>
                      <TableCell className="font-medium">
                        {stock.name}
                      </TableCell>
                      <TableCell>{formatCurrency(stock.price)}</TableCell>
                      <TableCell
                        className={
                          stock.change > 0
                            ? "text-green-600"
                            : stock.change < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }
                      >
                        {stock.change?.toFixed(2)} (
                        {stock.changePercent?.toFixed(2)}%)
                      </TableCell>
                      <TableCell>
                        {stock.marketCap ? formatNumber(stock.marketCap) : "—"}
                      </TableCell>
                      <TableCell>
                        {stock.volume ? formatNumber(stock.volume) : "—"}
                      </TableCell>
                      <TableCell>
                        {stock.previousClose
                          ? formatCurrency(stock.previousClose)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadMoreTable}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Load More
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <FooterTime />
      </div>
    </div>
  );
}
