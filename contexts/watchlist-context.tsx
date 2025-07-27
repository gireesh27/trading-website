"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { stockApi } from "@/lib/api/stock-api";
import { useToast } from "@/components/ui/use-toast";
import type {
  Watchlist,
  WatchlistItem,
  WatchlistContextType,
  PriceAlert,
} from "@/types/watchlistypes";

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("watchlists");
    if (stored) {
      const parsed: Watchlist[] = JSON.parse(stored).map((w: { createdAt: string | number | Date; updatedAt: string | number | Date; items: any[]; }) => ({
        ...w,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
        items: w.items.map((i: { addedAt: string | number | Date; }) => ({
          ...i,
          addedAt: new Date(i.addedAt),
        })),
      }));
      setWatchlists(parsed);
      setActiveWatchlistId(parsed[0]?.id ?? null);
    } else {
      const defaultList: Watchlist = {
        id: "default",
        name: "My Watchlist",
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      };
      setWatchlists([defaultList]);
      setActiveWatchlistId(defaultList.id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("watchlists", JSON.stringify(watchlists));
  }, [watchlists]);

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || null;

  const addToWatchlist = async (watchlistId: string, symbol: string) => {
    const upper = symbol.toUpperCase();
    const watchlist = watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    if (watchlist.items.some((item) => item.symbol === upper)) {
      toast({
        title: "Already Exists",
        description: `${upper} is already in your watchlist.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await stockApi.getQuote(upper);
      const newItem: WatchlistItem = {
        id: upper,
        symbol: upper,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        addedAt: new Date(),
      };

      const updatedLists = watchlists.map((w) =>
        w.id === watchlistId
          ? {
              ...w,
              items: [...w.items, newItem],
              updatedAt: new Date(),
            }
          : w
      );

      setWatchlists(updatedLists);
      toast({
        title: "Added to Watchlist",
        description: `${upper} added successfully.`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = (watchlistId: string, symbol: string) => {
    const upper = symbol.toUpperCase();
    const updatedLists = watchlists.map((w) =>
      w.id === watchlistId
        ? {
            ...w,
            items: w.items.filter((i) => i.symbol !== upper),
            updatedAt: new Date(),
          }
        : w
    );
    setWatchlists(updatedLists);
    toast({
      title: "Removed",
      description: `${upper} removed from your watchlist.`,
    });
  };

  const createWatchlist = (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const newList: Watchlist = {
      id,
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWatchlists((prev) => [...prev, newList]);
    setActiveWatchlistId(id);
  };

  const deleteWatchlist = (id: string) => {
    const remaining = watchlists.filter((w) => w.id !== id);
    setWatchlists(remaining);
    if (activeWatchlistId === id) {
      setActiveWatchlistId(remaining[0]?.id ?? null);
    }
  };

  const moveItem = (
    watchlistId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    const wl = watchlists.find((w) => w.id === watchlistId);
    if (!wl) return;

    const updatedItems = [...wl.items];
    const [moved] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, moved);

    const updatedLists = watchlists.map((w) =>
      w.id === watchlistId ? { ...w, items: updatedItems } : w
    );

    setWatchlists(updatedLists);
  };

  const createAlert = (
    symbol: string,
    type: "above" | "below",
    price: number
  ) => {
    const id = `${symbol}-${type}-${price}-${Date.now()}`;
    const newAlert: PriceAlert = {
      id,
      symbol,
      type,
      price,
      isActive: true,
      createdAt: new Date(),
    };

    const updated = watchlists.map((w) => ({
      ...w,
      items: w.items.map((i) =>
        i.symbol === symbol
          ? {
              ...i,
              alerts: [...(i.alerts ?? []), newAlert],
            }
          : i
      ),
    }));

    setWatchlists(updated);
    toast({
      title: "Alert Created",
      description: `${symbol} alert set for ${type} $${price}`,
    });
  };

  const deleteAlert = (alertId: string) => {
    const updated = watchlists.map((w) => ({
      ...w,
      items: w.items.map((i) => ({
        ...i,
        alerts: i.alerts?.filter((a) => a.id !== alertId),
      })),
    }));
    setWatchlists(updated);
  };

  const searchSymbols = async (query: string) => {
    // Implement with API call if needed
    return [];
  };

  const exportWatchlist = (id: string) => {
    const wl = watchlists.find((w) => w.id === id);
    if (!wl) return;
    const blob = new Blob([JSON.stringify(wl)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${wl.name}.json`;
    a.click();
  };

  const importWatchlist = (data: any) => {
    try {
      const imported: Watchlist = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        items: data.items.map((i: any) => ({
          ...i,
          addedAt: new Date(i.addedAt),
        })),
      };
      setWatchlists((prev) => [...prev, imported]);
      toast({
        title: "Import Successful",
        description: `Imported ${imported.name}`,
      });
    } catch (e) {
      toast({
        title: "Import Failed",
        description: "Invalid file format.",
        variant: "destructive",
      });
    }
  };

  const value: WatchlistContextType = {
    watchlists,
    activeWatchlist,
    isLoading,
    error,
    createWatchlist,
    deleteWatchlist,
    setActiveWatchlist: setActiveWatchlistId,
    addToWatchlist,
    removeFromWatchlist,
    moveItem,
    createAlert,
    deleteAlert,
    searchSymbols,
    exportWatchlist,
    importWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
