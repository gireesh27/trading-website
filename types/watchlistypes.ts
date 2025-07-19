export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  marketCap?: string | number;
  addedAt: Date;
  alerts?: PriceAlert[];
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  price: number;
  isActive: boolean;
  createdAt: Date;
}

export interface WatchlistContextType {
  watchlists: Watchlist[];
  activeWatchlist: Watchlist | null;
  isLoading: boolean;
  error: string | null;
  createWatchlist: (name: string) => void;
  deleteWatchlist: (id: string) => void;
  setActiveWatchlist: (id: string) => void;
  addToWatchlist: (watchlistId: string, symbol: string) => Promise<void>;
  removeFromWatchlist: (watchlistId: string, symbol: string) => void;
  moveItem: (watchlistId: string, fromIndex: number, toIndex: number) => void;
  createAlert: (symbol: string, type: 'above' | 'below', price: number) => void;
  deleteAlert: (alertId: string) => void;
  searchSymbols: (query: string) => Promise<any[]>;
  exportWatchlist: (watchlistId: string) => void;
  importWatchlist: (data: any) => void;
}
