"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useMarketData } from "./enhanced-market-data-context";

// ✅ Data Interfaces
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
export interface Order {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop";
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: "pending" | "filled" | "cancelled" | "partial";
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
export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

type OrderType = "market" | "limit" | "stop";

// ✅ Context Type
interface TradingContextType {
  portfolio: Portfolio;
  orders: Order[];
  transactions: Transaction[];
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  selectedStock: any;
  isLoading: boolean;
  placeOrder: (
    symbol: string,
    quantity: number,
    side: "buy" | "sell",
    type: OrderType,
    price?: number,
    stopPrice?: number
  ) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  fetchOrders: () => void;
  updatePortfolio: () => void;
  getPositionBySymbol: (symbol: string) => Position | undefined;
   refreshOrders: () => Promise<void>; // ✅ Add this
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stocks } = useMarketData();

  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 100000,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    availableCash: 100000,
    positions: [],
    dayChange: 0,
    dayChangePercent: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedStock = stocks.find(
    (s: { symbol: string }) => s.symbol === "AAPL"
  );
const fetchOrders = async () => {
  setIsLoading(true);
  try {
    const res = await fetch("/api/trading/orders");
    const data = await res.json();
    setOrders(data.orders || []);
  } catch (error) {
    console.error("Failed to fetch orders", error);
  } finally {
    setIsLoading(false);
  }
};

const refreshOrders = fetchOrders; // ✅ Alias if fetchOrders already exists

  const fetchTradingData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const headers = { "x-user-id": "user_123" };

    try {
      const endpoints = [
        fetch("/api/trading/portfolio", { headers }),
        fetch("/api/trading/orders", { headers }),
        fetch("/api/trading/transactions", { headers }),
      ];
      const responses = await Promise.all(endpoints);
      for (const res of responses) {
        if (!res.ok) throw new Error("Failed to fetch trading data");
      }
      const [portfolioData, ordersData, transactionsData] = await Promise.all(
        responses.map((r) => r.json())
      );

      if (portfolioData.success) setPortfolio(portfolioData.data);
      if (ordersData.success) setOrders(ordersData.data);
      if (transactionsData.success) setTransactions(transactionsData.data);
    } catch (error: any) {
      console.error("Failed to fetch trading data:", error.message);
      toast({
        title: "Error",
        description: "Could not load your trading data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const placeOrder = async (
    symbol: string,
    quantity: number,
    side: "buy" | "sell",
    type: OrderType,
    price?: number,
    stopPrice?: number
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/trading/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id || "user_123",
        },
        body: JSON.stringify({
          symbol,
          quantity,
          side,
          orderType: type,
          price,
          stopPrice,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to place order");

      toast({ title: "Success", description: `Order placed for ${symbol}` });
      await fetchTradingData();
      return true;
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    toast({
      title: "Cancel not implemented",
      description: "To be added later",
    });
    return false;
  };

  const getPositionBySymbol = (symbol: string) => {
    return portfolio.positions.find(
      (pos) => pos.symbol.toLowerCase() === symbol.toLowerCase()
    );
  };

  useEffect(() => {
    if (user) fetchTradingData();
  }, [user, fetchTradingData]);

  return (
    <TradingContext.Provider
      value={{
        portfolio,
        orders,
        transactions,
        refreshOrders,
        bids,
        asks,
        selectedStock: selectedStock || null,
        isLoading,
        placeOrder,
        cancelOrder,
        fetchOrders: fetchTradingData,
        updatePortfolio: fetchTradingData,
        getPositionBySymbol,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context)
    throw new Error("useTrading must be used within a TradingProvider");
  return context;
}