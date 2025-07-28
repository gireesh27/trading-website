import { IWatchlist } from "@/lib/Database/Models/Watchlist";
import { Watchlist, WatchlistItem } from "@/types/watchlistypes";

export function normalizeWatchlists(data: IWatchlist[]): Watchlist[] {
  return data.map((w): Watchlist => ({
    _id: w.id.toString(),
    name: w.name,
    isDefault: w.isDefault ?? false,
    createdAt: new Date(w.createdAt),
    updatedAt: new Date(w.updatedAt),
    items: w.stocks.map((s): WatchlistItem => ({
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      change: s.change,
      changePercent: s.changePercent,
      addedAt: new Date(s.addedAt),
      alerts: s.alerts?.map((a) => ({
        id: a.id,
        type: a.type,
        price: a.price,
        isActive: a.isActive,
        createdAt: new Date(a.createdAt),
        toggledAt: new Date(a.toggledAt),
      })) ?? [],
    })),
  }));
}
