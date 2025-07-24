// types/trading-types.ts

export type OrderStatus = "pending" | "filled" | "cancelled" | "partial";
export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop";

export interface Order {
  id: string;
  symbol: string;
  type: OrderSide;            // buy or sell
  orderType: OrderType;       // market, limit, or stop
  quantity: number;
  price?: number;             // optional for market orders
  stopPrice?: number;         // used for stop orders
  status: OrderStatus;
  createdAt: string;
  filledAt?: string;
  filledQuantity?: number;
}
export interface Transaction {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  fees: number;
  date: string;
}
export interface Portfolio {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  availableCash: number;
  positions: Position[];
  dayChange: number;
  dayChangePercent: number;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  type: "long" | "short";
  openDate: string;
}
export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: number
  exchange?: string
  sector?: string
  marketCap?: number
  isWatchlisted?: boolean
}

export interface CandlestickPoint {
  time: string
  open: number
  high: number
  low: number
  close: number
}

export interface AdvancedTradingChartProps {
  symbol: string
  name: string
  currentPrice: number
  chartCandlestickData: CandlestickPoint[] // 👈 renamed from candlestickData
  selectedStock: Stock | null
  selectStock: (stock: Stock) => void
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  activeWatchlist: string[]
  getCandlestickData: (symbol: string, timeframe?: string) => void
}

