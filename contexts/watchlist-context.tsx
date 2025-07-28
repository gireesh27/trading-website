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
import { useSession } from "next-auth/react";
const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(
    null
  );
  const { data: session } = useSession();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const activeWatchlist =
    watchlists.find((w) => w._id === activeWatchlistId) || null;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchWatchlists = async () => {
    const res = await fetch("/api/watchlist/get-all");
    const data = await res.json();
    if (data.success) {
      setWatchlists(data.watchlists);
      setActiveWatchlistId(data.watchlists[0]?._id ?? null);
    }
  };
  useEffect(() => {
    if (session) fetchWatchlists();
  }, [session]);

  const removeFromWatchlist = async (watchlistId: string, symbol: string) => {
    try {
      const res = await fetch("/api/watchlist/remove-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchlistId, symbol }),
      });
      const data = await res.json();
      if (data.success) {
        setWatchlists((prev) =>
          prev.map((w) => (w._id === watchlistId ? data.updated : w))
        );
        toast({ title: "Removed", description: symbol });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not remove stock.",
        variant: "destructive",
      });
    }
  };

  const createWatchlist = async (name: string) => {
    const res = await fetch("/api/watchlist/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.success) {
      setWatchlists((prev) => [...prev, data.watchlist]);
      setActiveWatchlistId(data.watchlist._id);
    }
  };

  const deleteWatchlist = async (id: string) => {
    await fetch("/api/watchlist/delete-watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const remaining = watchlists.filter((w) => w._id !== id);
    setWatchlists(remaining);
    setActiveWatchlistId(remaining[0]?._id ?? null);
  };

  const moveItem = (
    watchlistId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    const wl = watchlists.find((w) => w._id === watchlistId);
    if (!wl) return;

    const updatedItems = [...wl.items];
    const [moved] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, moved);

    const updatedLists = watchlists.map((w) =>
      w._id === watchlistId ? { ...w, items: updatedItems } : w
    );

    setWatchlists(updatedLists);
  };

  const createAlert = async (
    symbol: string,
    type: "above" | "below",
    price: number
  ) => {
    if (!activeWatchlistId) return;
    const alert = {
      id: `${symbol}-${type}-${price}-${Date.now()}`,
      symbol,
      type,
      price,
      isActive: true,
      createdAt: new Date(),
    };
    const res = await fetch("/api/watchlist/create-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchlistId: activeWatchlistId, symbol, alert }),
    });
    const data = await res.json();
    if (data.success) {
      setWatchlists((prev) =>
        prev.map((w) => (w._id === activeWatchlistId ? data.updated : w))
      );
    }
  };

  const deleteAlert = async (alertId: string, symbol: string) => {
    if (!activeWatchlistId) return;
    const res = await fetch("/api/watchlist/delete-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchlistId: activeWatchlistId, symbol, alertId }),
    });
    const data = await res.json();
    if (data.success) {
      setWatchlists((prev) =>
        prev.map((w) => (w._id === activeWatchlistId ? data.updated : w))
      );
    }
  };

  const exportWatchlist = (id: string) => {
    const wl = watchlists.find((w) => w._id === id);
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
  const addToWatchlist = async (watchlistId: string, symbol: string) => {
    const upper = symbol.toUpperCase();
    const watchlist = watchlists.find((w) => w._id === watchlistId);
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
      // 1. Get stock data
      const data = await stockApi.getQuote(upper);
      const newItem: WatchlistItem = {
        symbol: upper,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        addedAt: new Date(),
      };

      // 2. Save to DB and get updated list
      const res = await fetch("/api/watchlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchlistId, stock: newItem }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to add");

      // 3. Update local state with backend result
      setWatchlists((prev) =>
        prev.map((w) => (w._id === watchlistId ? json.updated : w))
      );

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
const toggleAlert = async (alertId: string, symbol: string) => {
  if (!activeWatchlistId) return;
  const res = await fetch("/api/watchlist/toggle-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watchlistId: activeWatchlistId, symbol, alertId }),
  });
  const data = await res.json();
  if (data.success) {
    setWatchlists((prev) =>
      prev.map((w) => (w._id === activeWatchlistId ? data.updated : w))
    );
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
    toggleAlert,
    deleteAlert,
    fetchWatchlists,
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
