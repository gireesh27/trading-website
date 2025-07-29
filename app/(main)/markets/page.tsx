// Enhanced stock markets page with modern UI, pagination, tabs, search, overview stats
"use client";

import { useEffect, useState } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FooterTime from "./FooterTime";
import { Search, RefreshCw } from "lucide-react";
import CountUp from "react-countup";
import Link from "next/link";

const ITEMS_PER_PAGE = 12;

export default function MarketsPage() {
  const { stocks, isLoading, error, refreshData } = useMarketData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "change" | "volume" | "marketCap">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"overview" | "table">("overview");
  const [overviewPage, setOverviewPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    const page = activeTab === "overview" ? overviewPage : tablePage;
    refreshData({ stockPage: page, ITEMS_PER_PAGE });
  }, [refreshData, overviewPage, tablePage, activeTab]);

  useEffect(() => {
    if (activeTab === "overview") setOverviewPage(1);
    else if (activeTab === "table") setTablePage(1);
  }, [searchTerm, sortBy, sortOrder, activeTab]);

  const filteredAndSorted = stocks
    .filter(
      (s) =>
        (s.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (s.symbol?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });

  const overviewData = filteredAndSorted;
  const tableData = filteredAndSorted;

  const marketStats = {
    totalMarketCap: stocks.reduce((sum, s) => sum + (s.marketCap || 0), 0),
    totalVolume: stocks.reduce((sum, s) => sum + (s.volume || 0), 0),
    gainers: stocks.filter((s) => s.changePercent > 0).length,
    losers: stocks.filter((s) => s.changePercent < 0).length,
  };

  const formatLargeNumber = (num: number | undefined): string => {
    if (!num || isNaN(num)) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-[#131722] text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Stock Markets</h1>
            <p className="text-gray-400">Live stock prices and market data</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={() => refreshData({ stockPage: activeTab === "overview" ? overviewPage : tablePage, ITEMS_PER_PAGE })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Total Market Cap</p>
              <p className="text-white text-lg font-semibold">
                {formatLargeNumber(marketStats.totalMarketCap)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-white text-lg font-semibold">
                {formatLargeNumber(marketStats.totalVolume)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Gainers</p>
              <p className="text-green-500 text-lg font-semibold">
                <CountUp end={marketStats.gainers} duration={1.5} />
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Losers</p>
              <p className="text-red-500 text-lg font-semibold">
                <CountUp end={marketStats.losers} duration={1.5} />
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-gray-800 border-gray-700 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overviewData.map((stock) => (
                <Link key={stock.symbol} href={`/trade/${stock.symbol.toLowerCase()}`}>
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-semibold">
                        {stock.name} ({stock.symbol})
                      </h3>
                      <span
                        className={`text-sm font-medium ${
                          stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {typeof stock.changePercent === "number"
                          ? stock.changePercent.toFixed(2)
                          : "0.00"}
                        %
                      </span>
                    </div>
                    <div className="mt-2 text-white text-lg font-bold">
                      {typeof stock.price === "number"
                        ? `$${stock.price.toFixed(2)}`
                        : "N/A"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Table View Tab */}
          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 text-sm">
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Name</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Change %</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="border-b border-gray-800 hover:bg-gray-700 cursor-pointer"
                      onClick={() => (window.location.href = `/trade/${stock.symbol.toLowerCase()}`)}
                    >
                      <td className="p-2 text-white font-medium">{stock.symbol}</td>
                      <td className="p-2 text-white">{stock.name}</td>
                      <td className="p-2 text-right text-white">
                        {typeof stock.price === "number"
                          ? `$${stock.price.toFixed(2)}`
                          : "N/A"}
                      </td>
                      <td
                        className={`p-2 text-right font-medium ${
                          stock.changePercent >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {typeof stock.changePercent === "number"
                          ? stock.changePercent.toFixed(2)
                          : "0.00"}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <FooterTime />
      </div>
    </div>
  );
}
