"use client";

import React, { useState, useEffect } from "react";
import { useWatchlist } from "@/contexts/watchlist-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "../ui/use-toast";
import { stockApi } from "@/lib/api/stock-api";
import { cn } from "@/lib/utils"; // Optional utility for class merging

interface SymbolSuggestion {
  symbol: string;
  name: string;
}

export function WatchlistWidget() {
  const { activeWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState("");
  const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Please enter a stock symbol.",
        variant: "destructive",
      });
      return;
    }

    if (!activeWatchlist?._id) return;

    setLoadingId("add");

    try {
      const allSuggestions = await stockApi.searchSymbol(symbol);
      const matched = allSuggestions.find((s) => s.symbol.toUpperCase() === symbol);

      if (!matched) {
        toast({
          title: "Invalid Symbol",
          description: `Symbol "${symbol}" not found.`,
          variant: "destructive",
        });
        setLoadingId(null);
        return;
      }

      await addToWatchlist(activeWatchlist._id, symbol);

      toast({
        title: "Success",
        description: `${symbol} added to your watchlist.`,
      });

      setNewSymbol("");
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add symbol",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    if (!activeWatchlist?._id) return;
    setLoadingId(symbol);

    try {
      await removeFromWatchlist(activeWatchlist._id, symbol);
      toast({
        title: "Removed",
        description: `${symbol.toUpperCase()} removed from your watchlist.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to remove symbol",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Watchlist</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddSymbol} className="flex items-center gap-2 mb-4 relative">
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
          <Button type="submit" size="icon" disabled={loadingId === "add"}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activeWatchlist?.items?.length ? (
            activeWatchlist.items.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <Link href={`/trade/${item.symbol.toLowerCase()}`} className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.symbol}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${item.price?.toFixed(2) ?? "N/A"}
                      </p>
                      <p
                        className={`text-xs ${
                          (item.change ?? 0) >= 0 ? "text-green-400" : "text-red-400"
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
            <p className="text-center text-gray-500 py-4">Your watchlist is empty.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
