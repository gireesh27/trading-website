export interface PriceAlert {
  id: string;
  symbol: string;
  sector?: string;
  type: 'price' | 'percent_change' | 'volume';
  condition: 'above' | 'below';
  value: number;
  status: 'active' | 'triggered' | 'inactive'; // status tracks full state
  isActive: boolean; // ✅ Add this field for UI toggling logic
  createdAt: string;
  triggeredAt?: string;
}


export interface WatchlistItem {
  symbol: string;
  sector?: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  addedAt: Date;
  alerts?: PriceAlert[];
}

export interface Watchlist {
  _id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}



export interface WatchlistContextType {
  watchlists: Watchlist[];
  activeWatchlist: Watchlist | null;
  isLoading: boolean;         // ✅ Add this
  error: string | null;       // ✅ Add this if not already present
  createWatchlist: (name: string) => void;
  deleteWatchlist: (id: string) => void;
  setActiveWatchlist: (id: string | null) => void;
  addToWatchlist: (watchlistId: string, symbol: string, sector: string) => Promise<void>;
  removeFromWatchlist: (watchlistId: string, symbol: string) => void;
  moveItem: (watchlistId: string, fromIndex: number, toIndex: number) => void;
  createAlert: (symbol: string, type: "above" | "below", price: number) => void;
  deleteAlert: (alertId: string, symbol: string) => void;
  fetchWatchlists: () => Promise<void>;
  exportWatchlist: (id: string) => void;
  importWatchlist: (data: any) => void;
  toggleAlert: (alertId: string, symbol: string) => Promise<void>;
  updateWatchlistName: (id: string, newName: string) => void;
  searchSymbols: (query: string) => Promise<any[]>;
}
