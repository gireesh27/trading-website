"use client";

import { useWatchlist } from "@/contexts/watchlist-context";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {stockApi} from "@/lib/api/stock-api";

export function WatchlistDisplay() {
  const {
    watchlists,
    createWatchlist,
    deleteWatchlist,
    removeFromWatchlist,
    addToWatchlist,
  } = useWatchlist();

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newSymbols, setNewSymbols] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Record<string, any[]>>({});

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(newWatchlistName.trim());
      setNewWatchlistName("");
      setOpen(false);
    }
  };

  const handleAddStock = async (watchlistId: string) => {
    const symbol = newSymbols[watchlistId]?.trim().toUpperCase();
    if (!symbol) return;

    try {
      const data = await stockApi.getQuote(symbol);
      if (!data || !data.symbol) throw new Error("Invalid symbol");

      setErrors((prev) => ({ ...prev, [watchlistId]: "" }));
      addToWatchlist(watchlistId, symbol);
      setNewSymbols((prev) => ({ ...prev, [watchlistId]: "" }));
    } catch {
      setErrors((prev) => ({ ...prev, [watchlistId]: `Symbol '${symbol}' not found.` }));
    }
  };

  const handleSymbolChange = async (watchlistId: string, value: string) => {
    setNewSymbols((prev) => ({ ...prev, [watchlistId]: value }));
    setErrors((prev) => ({ ...prev, [watchlistId]: "" }));

    // Suggestions
    try {
      const res = await stockApi.searchSymbol(value);
      setSuggestions((prev) => ({ ...prev, [watchlistId]: res.slice(0, 5) }));
    } catch {
      setSuggestions((prev) => ({ ...prev, [watchlistId]: [] }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Your Watchlists</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Watchlist name..."
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                onKeyDown={(e) => e.key === "Enter" && handleCreateWatchlist()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWatchlist}
                  disabled={!newWatchlistName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlists.map((watchlist) => (
          <div
            key={watchlist._id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">{watchlist.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {watchlist.items?.length} item{watchlist.items?.length !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  size="icon"
                  onClick={() => deleteWatchlist(watchlist._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Input
                placeholder="Add stock (e.g. AAPL)"
                value={newSymbols[watchlist._id] || ""}
                onChange={(e) => handleSymbolChange(watchlist._id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddStock(watchlist._id)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors[watchlist._id] && (
                <p className="text-red-500 text-xs ml-1">{errors[watchlist._id]}</p>
              )}
              {suggestions[watchlist._id]?.length > 0 && (
                <ul className="bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-32 overflow-y-auto text-white text-sm">
                  {suggestions[watchlist._id].map((s) => (
                    <li
                      key={s.symbol}
                      className="px-3 py-1 hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        setNewSymbols((prev) => ({ ...prev, [watchlist._id]: s.symbol }));
                        setSuggestions((prev) => ({ ...prev, [watchlist._id]: [] }));
                      }}
                    >
                      {s.symbol} - {s.name}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                onClick={() => handleAddStock(watchlist._id)}
                className="bg-blue-600 hover:bg-blue-700 mt-2"
              >
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {(watchlist.items ?? []).map((item) => (
                <div
                  key={item.symbol}
                  className="flex justify-between items-center p-2 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer transition"
                  onClick={() => router.push(`/trade/${item.symbol}`)}
                >
                  <div className="text-white font-medium">{item.symbol}</div>
                  <div className="text-sm text-gray-300 text-right">
                    <div>{item.name}</div>
                    <div className="text-xs">
                      ₹{item.price?.toFixed(2) ?? "N/A"} {" "}
                      <span className={(item.change ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
                        ({(item.changePercent ?? 0).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(watchlist._id, item.symbol);
                    }}
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(watchlist.items ?? []).length === 0 && (
                <p className="text-sm text-gray-400 text-center italic">
                  No items in this watchlist.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}