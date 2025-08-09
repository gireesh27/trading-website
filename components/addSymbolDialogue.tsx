"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2 } from "lucide-react";
import { useWatchlist } from "@/contexts/watchlist-context";

interface SearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  exchDisp: string;
  typeDisp: string;
}

export function AddSymbolDialog() {
  const { activeWatchlist, addToWatchlist, searchSymbols, isLoading } =
    useWatchlist();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const searchTimeoutRef = useRef<number | null>(null);
  const [sector, setSector] = useState("");
  useEffect(() => {
    if (query.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = window.setTimeout(async () => {
        setSearching(true);
        try {
          const searchResults = await searchSymbols(query);
          setResults(searchResults.slice(0, 10));
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchSymbols]);
  const handleAddSymbol = async (symbol: string, sector: string) => {
    if (activeWatchlist) {
      setSelectedSymbol(symbol);
      await addToWatchlist(activeWatchlist._id, symbol, sector);
      setSelectedSymbol("");
      setOpen(false);
      setQuery("");
      setResults([]);
    }
  };

  const popularSymbols = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NFLX", name: "Netflix Inc." },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Add Symbol to Watchlist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stocks, ETFs, crypto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          // Add a simple dropdown before the results
          <div className="mb-2">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white rounded-md w-full p-2"
            >
              <option value="">Select Sector</option>
              <option value="markets">Markets</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          {/* Search Results */}
          {results.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              <p className="text-gray-400 text-sm font-medium px-2">
                Search Results
              </p>
              {results.map((result) => (
                <div
                  key={result.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => handleAddSymbol(result.symbol, sector)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">
                        {result.symbol}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-500 text-gray-400"
                      >
                        {result.exchDisp}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm truncate">
                      {result.longname || result.shortname}
                    </p>
                    <p className="text-gray-500 text-xs">{result.typeDisp}</p>
                  </div>

                  {selectedSymbol === result.symbol && isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Popular Symbols */}
          {query.length < 2 && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium px-2">
                Popular Symbols
              </p>
              <div className="grid grid-cols-2 gap-2">
                {popularSymbols.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
                    onClick={() => handleAddSymbol(stock.symbol, sector)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-semibold text-sm">
                          {stock.symbol}
                        </span>
                        <p className="text-gray-400 text-xs truncate">
                          {stock.name}
                        </p>
                      </div>
                      {selectedSymbol === stock.symbol && isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                      ) : (
                        <Plus className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* No Results */}
          {query.length >= 2 && !searching && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No symbols found</p>
              <p className="text-gray-500 text-sm">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
