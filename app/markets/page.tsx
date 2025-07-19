"use client";

import { MainNav } from "@/components/main-nav";
import { MarketTicker } from "@/components/market-ticker";
import {
  useMarketData,
  MarketDataProvider,
} from "@/contexts/enhanced-market-data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function MarketsPage() {
  const { stocks: marketData, isLoading } = useMarketData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = marketData.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topGainers = [...marketData]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);
  const topLosers = [...marketData]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#131722]">
      <MainNav />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Stock Markets
            </h1>
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topGainers.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/trade/${stock.symbol.toLowerCase()}`}
                >
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700">
                    <div>
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${stock.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-400">
                        +{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topLosers.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/trade/${stock.symbol.toLowerCase()}`}
                >
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700">
                    <div>
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <p className="text-xs text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${stock.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-red-400">
                        {stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 h-28 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredData.map((stock) => (
                  <Link
                    key={stock.symbol}
                    href={`/trade/${stock.symbol.toLowerCase()}`}
                  >
                    <div className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white text-lg">
                            {stock.symbol}
                          </p>
                          <p className="text-gray-400 text-sm truncate w-32">
                            {stock.name}
                          </p>
                        </div>
                        <div
                          className={`text-right ${
                            stock.changePercent >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          <p className="font-semibold">
                            {stock.changePercent >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-white">
                          ${stock.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
