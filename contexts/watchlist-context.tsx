"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useMarketData } from "./enhanced-market-data-context";
import { useToast } from "@/components/ui/use-toast";
import type {
  Watchlist,
  WatchlistItem,
  WatchlistContextType,
} from "@/types/watchlistypes";
import { stockAPI } from "@/lib/api/stock-api";

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { stocks: marketData, getCandlestickData } = useMarketData();
  const { toast } = useToast();
  const [activeWatchlist, setActiveWatchlist] = useState<Watchlist | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load watchlist from localStorage on initial render
  useEffect(() => {
    try {
      const savedWatchlistJSON = localStorage.getItem("user-watchlist");
      if (savedWatchlistJSON) {
        setActiveWatchlist(JSON.parse(savedWatchlistJSON));
      } else {
        setActiveWatchlist({
          id: "default-watchlist",
          name: "My Watchlist",
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: true,
        });
      }
    } catch (e) {
      console.error("Failed to parse watchlist from localStorage", e);
      setActiveWatchlist({
        id: "default-watchlist",
        name: "My Watchlist",
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      });
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (activeWatchlist) {
      localStorage.setItem("user-watchlist", JSON.stringify(activeWatchlist));
    }
  }, [activeWatchlist]);

  const getStockData = async (
    symbol: string
  ): Promise<WatchlistItem | null> => {
    try {
      const data = await stockAPI.getQuote(symbol);
      if (data && data.symbol) {
        return {
          id: data.symbol,
          ...data, // Assuming data already contains properties like symbol, name, price, etc.
          addedAt: new Date(), // Add the missing property
        };
      }
      return null;
    } catch (err) {
      console.error("getStockData error:", err);
      return null;
    }
  };

  const addToWatchlist = useCallback(
    async (symbol: string) => {
      const upperCaseSymbol = symbol.toUpperCase();
      if (activeWatchlist?.items.some((item) => item.symbol === upperCaseSymbol)) {
        toast({
          title: "Already in Watchlist",
          description: `${upperCaseSymbol} is already on your list.`,
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const stockData = await getStockData(upperCaseSymbol);
        if (!stockData) {
          throw new Error(
            `Could not find data for the symbol "${upperCaseSymbol}".`
          );
        }

        setActiveWatchlist((prev) => {
          if (!prev) return null;
          return { ...prev, items: [...prev.items, stockData] };
        });

        toast({
          title: "Success",
          description: `${upperCaseSymbol} has been added to your watchlist.`,
        });
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error Adding Symbol",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeWatchlist, toast]
  );

  const removeFromWatchlist = useCallback((symbol: string) => {
    const upperCaseSymbol = symbol.toUpperCase();
    setActiveWatchlist((prev) => {
      if (!prev) return null;
      const newItems = prev.items.filter(
        (item) => item.symbol !== upperCaseSymbol
      );
      return { ...prev, items: newItems };
    });
    toast({
      title: "Symbol Removed",
      description: `${upperCaseSymbol} has been removed from your watchlist.`,
    });
  }, []);

  const value: WatchlistContextType = {
    activeWatchlist,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    watchlists: [],
    createWatchlist: () => {
      throw new Error("Function not implemented.");
    },
    deleteWatchlist: () => {
      throw new Error("Function not implemented.");
    },
    setActiveWatchlist: () => {
      throw new Error("Function not implemented.");
    },
    moveItem: () => {
      throw new Error("Function not implemented.");
    },
    createAlert: () => {
      throw new Error("Function not implemented.");
    },
    deleteAlert: () => {
      throw new Error("Function not implemented.");
    },
    searchSymbols: async () => {
      throw new Error("Function not implemented.");
    },
    exportWatchlist: () => {
      throw new Error("Function not implemented.");
    },
    importWatchlist: () => {
      throw new Error("Function not implemented.");
    },
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
