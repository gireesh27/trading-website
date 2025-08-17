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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { stockApi } from "@/lib/api/stock-api";

export function WatchlistDisplay() {
  const {
    watchlists,
    createWatchlist,
    deleteWatchlist,
    removeFromWatchlist,
    addToWatchlist,
    updateWatchlistName,
  } = useWatchlist();

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [newSymbols, setNewSymbols] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Record<string, any[]>>({});
  const [sectors, setSectors] = useState<{ [key: string]: string }>({});
  // key: watchlistId, value: sector

  const handleSectorChange = (watchlistId: string, value: string) => {
    setSectors((prev) => ({
      ...prev,
      [watchlistId]: value,
    }));
  };
  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(newWatchlistName.trim());
      setNewWatchlistName("");
      setOpen(false);
    }
  };

const handleRename = async (id: string) => {
  if (!editedName.trim()) {
    toast.error("Please enter a valid name.");
    return;
  }

  try {
    await updateWatchlistName(id, editedName.trim());
    toast.success("Watchlist name updated.");
    setEditId(null);
  } catch (error: any) {
    toast.error(error?.message || "Failed to rename watchlist.");
  }
};

const handleAddStock = async (watchlistId: string, sector: string) => {
  const symbol = newSymbols[watchlistId]?.trim().toUpperCase();
  if (!symbol) {
    toast.error("Please enter a stock symbol.");
    return;
  }

  try {
    const data = await stockApi.getQuote(symbol);
    if (!data || !data.symbol) throw new Error("Invalid symbol");

    setErrors((prev) => ({ ...prev, [watchlistId]: "" }));
    await addToWatchlist(watchlistId, symbol, sector);

    toast.success(`${symbol} added to your watchlist.`);
    setNewSymbols((prev) => ({ ...prev, [watchlistId]: "" }));
  } catch (error: any) {
    setErrors((prev) => ({
      ...prev,
      [watchlistId]: `Symbol '${symbol}' not found.`,
    }));
    toast.error(error?.message || `Symbol '${symbol}' not found.`);
  }
};

  const handleSymbolChange = async (watchlistId: string, value: string) => {
    setNewSymbols((prev) => ({ ...prev, [watchlistId]: value }));
    setErrors((prev) => ({ ...prev, [watchlistId]: "" }));

    try {
      const res = await stockApi.searchSymbol(value);
      setSuggestions((prev) => ({ ...prev, [watchlistId]: res.slice(0, 5) }));
    } catch {
      setSuggestions((prev) => ({ ...prev, [watchlistId]: [] }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          🗂️ Your Watchlists
        </h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-black hover:text-white border-gray-600 hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Watchlist
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-gray-800 border border-gray-700 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-semibold">
                Create New Watchlist
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                placeholder="Watchlist name..."
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                onKeyDown={(e) => e.key === "Enter" && handleCreateWatchlist()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 border-gray-600 text-black hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWatchlist}
                  disabled={!newWatchlistName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Watchlist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlists.map((watchlist) => (
          <div
            key={watchlist._id}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-5 shadow-md transition hover:border-gray-600"
          >
            {/* Header + Rename/Delete */}
            <div className="flex items-start justify-between">
              {editId === watchlist._id ? (
                <div className="flex gap-2 w-full">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-gray-700 text-white flex-1"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleRename(watchlist._id)
                    }
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleRename(watchlist._id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <h3 className="text-white font-semibold text-lg flex items-center">
                  {watchlist.name}
                  <button
                    onClick={() => {
                      setEditId(watchlist._id);
                      setEditedName(watchlist.name);
                    }}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </h3>
              )}

              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                size="icon"
                onClick={() => deleteWatchlist(watchlist._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Add Stock */}
            <div className="space-y-2">
              <Input
                placeholder="Add stock (e.g. AAPL)"
                value={newSymbols[watchlist._id] || ""}
                onChange={(e) =>
                  handleSymbolChange(watchlist._id, e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddStock(watchlist._id, sectors[watchlist._id] || "");
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />

              {/* Sector Selection */}
              <select
                value={sectors[watchlist._id] || ""}
                onChange={(e) =>
                  handleSectorChange(watchlist._id, e.target.value)
                }
                className="bg-gray-700 border-gray-600 text-white rounded-md w-full p-2"
              >
                <option value="">Select Sector</option>
                <option value="markets">Markets</option>
                <option value="crypto">Crypto</option>
              </select>

              {errors[watchlist._id] && (
                <p className="text-red-500 text-xs">{errors[watchlist._id]}</p>
              )}

              {suggestions[watchlist._id]?.length > 0 && (
                <ul className="bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-32 overflow-y-auto text-white text-sm shadow">
                  {suggestions[watchlist._id].map((s) => (
                    <li
                      key={s.symbol}
                      className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        setNewSymbols((prev) => ({
                          ...prev,
                          [watchlist._id]: s.symbol,
                        }));
                        setSuggestions((prev) => ({
                          ...prev,
                          [watchlist._id]: [],
                        }));
                      }}
                    >
                      {s.symbol} —{" "}
                      <span className="text-gray-400">{s.name}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                onClick={() =>
                  handleAddStock(watchlist._id, sectors[watchlist._id] || "")
                }
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                Add
              </Button>
            </div>

            {/* Watchlist Items */}
            <div className="space-y-2">
              {(watchlist.items ?? []).map((item) => (
                <div
                  key={item.symbol}
                  className="flex justify-between items-center p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition cursor-pointer"
                  onClick={() => router.push(`/trade/${item.symbol}`)}
                >
                  <div className="text-white font-medium">{item.symbol}</div>
                  <div className="text-sm text-right text-gray-300">
                    <div>{item.name}</div>
                    <div className="text-xs">
                      ₹{item.price?.toFixed(2) ?? "N/A"}{" "}
                      <span
                        className={
                          (item.change ?? 0) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
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
