"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import type { Order } from "@/types/Order-types";
import { useOrders } from "@/contexts/order-context";
import { OrderDatePicker } from "../DatePicker";
import Loading from "@/components/loader"
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface OrderBookProps {
  symbol: string;
  orderId: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface HistoryEntry {
  _id: string;
  symbol: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop" | string;
  quantity: number;
  price?: number;
  targetPrice?: number;
  stopPrice?: number;
  averagePrice?: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
  holdingPeriod?: number; // in days or N/A
}

export function OrderBook() {
  const [selectedStock, setSelectedStock] = useState<Order | null>(null);
  const [symbol, setSymbol] = useState<string>("");
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [depth, setDepth] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<HistoryEntry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const {
    orders,
    isLoading,
    placeOrder,
    cancelOrder,
    getOrderHistory,
    getOpenOrders,
    fetchOrders,
    getOrder,
  } = useOrders();
  const [allOrders, setAllOrders] = useState<HistoryEntry[]>([]);

  // Call this with selected status/date to filter
  const filterOrders = (status: string, date?: Date) => {
    let filtered = allOrders;

    if (status !== "all") {
      filtered = filtered.filter((order) => order.status === status);
    }

    if (date) {
      filtered = filtered.filter(
        (order) =>
          new Date(order.createdAt).toDateString() === date.toDateString()
      );
    }

    setOrderHistory(filtered);
  };

  const fetchOrderHistory = async () => {
    if (!isRefreshing) setIsRefreshing(true);
    try {
      const res = await fetch("/api/trading/orders");
      const data = await res.json();
      setAllOrders(data.orders || []);
      setOrderHistory(data.orders || []);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (showHistory) fetchOrderHistory();
  }, [showHistory]);

  useEffect(() => {
    if (!symbol || showHistory) return;

    const fetchOrderBook = async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch(`/api/trading/orderbook/${symbol}`);
        const data = await res.json();

        if (res.ok) {
          setBids(data.bids || []);
          setAsks(data.asks || []);
        } else {
          console.error("Order book API error:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch order book:", err);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [symbol, showHistory]);

  useEffect(() => {
    const price = selectedStock?.price;
    if (!price || price === lastPrice) return;

    setPriceFlash(price > (lastPrice || 0) ? "up" : "down");
    setLastPrice(price);

    const timeout = setTimeout(() => setPriceFlash(null), 500);
    return () => clearTimeout(timeout);
  }, [selectedStock?.price]);

  useEffect(() => {
    if (showHistory) fetchOrderHistory();
  }, [showHistory]);

  const maxTotal = useMemo(() => {
    const all = [...bids, ...asks];
    return all.length ? Math.max(...all.map((e) => e.total)) : 1;
  }, [bids, asks]);

  const renderOrderRow = (order: OrderBookEntry, type: "bid" | "ask") => {
    const barWidth = (order.total / maxTotal) * 100;
    const colorClass = type === "bid" ? "bg-green-500/20" : "bg-red-500/20";
    const priceColor = type === "bid" ? "text-green-400" : "text-red-400";

    return (
      <div
        key={`${type}-${order.price}-${order.quantity}`}
        className="relative px-6 py-2 hover:bg-gray-700 transition-colors text-sm font-mono rounded-md overflow-hidden"
      >
        <div
          className={`absolute top-0 bottom-0 left-0 ${colorClass}`}
          style={{ width: `${barWidth}%` }}
        />
        <div className="relative grid grid-cols-3 gap-4 z-10">
          <span className={priceColor}>{order.price.toFixed(2)}</span>
          <span className="text-right text-white">
            {order.quantity.toFixed(4)}
          </span>
          <span className="text-right text-white">
            {order.total.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

const renderHistoryRow = (order: HistoryEntry) => {
  const createdDate = new Date(order.createdAt);
  const completedDate = order.updatedAt ? new Date(order.updatedAt) : null;

  const holdingPeriod = completedDate
    ? Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))
    : "N/A";

  const isBuy = order.type === "buy";
  const priceFormatted = order.price
    ? `${isBuy ? "-" : "+"}₹${order.price.toFixed(2)}`
    : "Market";

  const statusColor =
    order.status === "completed"
      ? "text-green-400"
      : order.status === "pending"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div
      key={order._id}
      className="grid grid-cols-7 gap-2 px-3 py-1.5 text-xs border-b border-gray-800 text-white hover:bg-gray-800"
    >
      <span className="font-medium">{order.orderType.toUpperCase()}</span>
      <span className={clsx(isBuy ? "text-green-400" : "text-red-400", "font-semibold")}>
        {order.type.toUpperCase()}
      </span>
      <span className="text-right">{order.quantity}</span>
      <span className={clsx("text-right", isBuy ? "text-green-400" : "text-red-400")}>
        {priceFormatted}
      </span>
      <span className={clsx("text-right", statusColor)}>{order.status}</span>
      <span className="text-right">{holdingPeriod}</span>
      <span className="text-right text-gray-400 font-mono">
        {createdDate.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
      </span>
    </div>
  );
};



  return (
    <Card className="bg-gradient-to-br from-zinc-900/80 to-black border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-black/40 border-b border-white/10">
        <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-400" />
          {showHistory ? "Order History" : "Order Book"}
        </CardTitle>
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-1 rounded-md"
            disabled={showHistory}
          >
            {[5, 10, 20].map((d) => (
              <option key={d} value={d}>
                Depth: {d}
              </option>
            ))}
          </select>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              showHistory ? fetchOrderHistory() : setIsRefreshing(true)
            }
            className="text-white hover:text-white"
          >
            <RefreshCcw
              className={clsx("h-4 w-4", { "animate-spin": isRefreshing })}
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="text-xs font-medium px-3 py-1.5"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "View Book" : "View History"}
          </Button>
        </div>
      </CardHeader>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-black/20">
        <OrderDatePicker
          onDateSelect={(date) => {
            setSelectedDate(date);
            filterOrders(selectedStatus, date);
          }}
        />

        <Select
          value={selectedStatus}
          onValueChange={(status) => {
            setSelectedStatus(status);
            filterOrders(status, selectedDate);
          }}
        >
          <SelectTrigger className="w-[180px] bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-white border-white/10">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CardContent className="pb-6">
        {showHistory ? (
          <ScrollArea className="max-h-[400px] px-6">
            {orderHistory.length > 0 ? (
              <>
                <div className="grid grid-cols-7 gap-3 text-xs font-semibold text-white border-b border-gray-700 pb-2 px-4">
                  <span>Type</span>
                  <span>Side</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Buy/Sell Price</span>
                  <span className="text-right">Status</span>
                  <span className="text-right">Holding</span>
                  <span className="text-right">Date</span>
                </div>
                {orderHistory.map(renderHistoryRow)}
              </>
            ) : (
              <div className="text-center text-white py-6 text-sm">
                {selectedStatus === "pending" &&
                  `No pending orders`}
                {selectedStatus === "completed" &&
                  `No completed orders`}
                {selectedStatus === "cancelled" &&
                  `No cancelled orders`}
                {selectedStatus === "all" && `No history for ${symbol}`}
              </div>
            )}
          </ScrollArea>
        ) : (
          <div className="space-y-2">
            <div className="px-6 py-2 bg-gray-800 rounded-t-lg">
              <div className="grid grid-cols-3 text-xs font-semibold text-white">
                <span>Price (USD)</span>
                <span className="text-right">Quantity</span>
                <span className="text-right">Total</span>
              </div>
            </div>

            {asks.length ? (
              [...asks]
                .reverse()
                .slice(0, depth)
                .map((ask) => renderOrderRow(ask, "ask"))
            ) : (
              <div className="text-center text-white py-4 text-sm">
                No sell orders
              </div>
            )}

            <div className="px-6 py-4 text-white bg-gray-900 border-y border-gray-700 text-center">
              <div
                className={clsx(
                  "text-2xl font-bold tracking-tight",
                  priceFlash === "up" && "text-green-400 animate-pulse",
                  priceFlash === "down" && "text-red-400 animate-pulse",
                  !priceFlash && "text-white"
                )}
              >
                ${selectedStock?.price?.toFixed(2) || "0.00"}
              </div>
              <div className="text-xs text-white mt-1">Last Price</div>
            </div>

            {bids.length ? (
              bids.slice(0, depth).map((bid) => renderOrderRow(bid, "bid"))
            ) : (
              <div className="text-center text-white py-4 text-sm">
                No buy orders
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
