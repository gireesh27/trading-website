"use client";

import React, { useState, useEffect } from "react";
import { useWatchlist } from "@/contexts/watchlist-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { stockApi } from "@/lib/api/stock-api";
import { cn } from "@/lib/utils"; // Optional utility for class merging
import { Meteors } from "@/components/ui/meteors";

interface SymbolSuggestion {
  symbol: string;
  sector?: string;
  name: string;
}

export function WatchlistWidget() {
  const { activeWatchlist, addToWatchlist, removeFromWatchlist } =
    useWatchlist();
  const [sector, setSector] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = newSymbol.trim();
      if (trimmed.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await stockApi.searchSymbol(trimmed);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } catch (e) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [newSymbol]);
  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = newSymbol.trim().toUpperCase();

    if (!symbol) {
      toast.error("Please enter a stock symbol.");
      return;
    }

    if (!activeWatchlist?._id) return;

    setLoadingId("add");

    try {
      const allSuggestions = await stockApi.searchSymbol(symbol);
      const matched = allSuggestions.find(
        (s) => s.symbol.toUpperCase() === symbol
      );

      if (!matched) {
        toast.error(`Symbol "${symbol}" not found.`);
        setLoadingId(null);
        return;
      }

      // Pass the sector from the matched suggestion
      await addToWatchlist(activeWatchlist._id, symbol, sector);

      toast.success(`${symbol} added to your watchlist.`);

      setNewSymbol("");
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add symbol");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    if (!activeWatchlist?._id) return;
    setLoadingId(symbol);

    try {
      await removeFromWatchlist(activeWatchlist._id, symbol);
      toast.info(`${symbol.toUpperCase()} removed from your watchlist.`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove symbol");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 relative overflow-hidden">
      {/* Meteors Effect */}
      <Meteors className="absolute inset-0 pointer-events-none" number={25} />

      <CardHeader>
        <CardTitle className="text-white">Watchlist</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleAddSymbol}
          className="flex items-center gap-2 mb-4 relative flex-wrap sm:flex-nowrap"
        >
          {/* Symbol Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Add symbol (e.g., AAPL)"
              value={newSymbol}
              onChange={(e) => {
                setNewSymbol(e.target.value);
                setShowSuggestions(true);
              }}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => newSymbol && setShowSuggestions(true)}
            />

            {/* Suggestion Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                {suggestions.map((s) => (
                  <div
                    key={s.symbol}
                    className="p-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setNewSymbol(s.symbol);
                      setShowSuggestions(false);
                    }}
                  >
                    {s.symbol} — <span className="text-gray-400">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sector Selector */}
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="">Select Sector</option>
            <option value="Markets">Markets</option>
            <option value="Crypto">Crypto</option>
          </select>

          {/* Add Button */}
          <Button type="submit" size="icon" disabled={loadingId === "add"}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Watchlist Items */}
        <div className="space-y-2 max-h-96 overflow-y-auto relative z-10">
          {activeWatchlist?.items?.length ? (
            activeWatchlist.items.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <Link
                  href={`/trade/${item.symbol.toLowerCase()}`}
                  className="flex-grow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.symbol}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">
                        {item.name}
                      </p>
                      {item.sector && (
                        <p className="text-xs text-cyan-400">{item.sector}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${item.price?.toFixed(2) ?? "N/A"}
                      </p>
                      <p
                        className={`text-xs ${
                          (item.change ?? 0) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {(item.change ?? 0) >= 0 ? "+" : ""}
                        {(item.change ?? 0).toFixed(2)} (
                        {(item.changePercent ?? 0).toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveSymbol(item.symbol)}
                  disabled={loadingId === item.symbol}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              Your watchlist is empty.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
