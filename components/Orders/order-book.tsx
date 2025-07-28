"use client";

import { useMemo, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { OrderBookEntry } from "@/contexts/trading-context";

interface OrderBookProps {
  symbol: string;
}

interface HistoryEntry {
  _id: string;
  symbol: string;
  type: "buy" | "sell";
  orderType: string;
  quantity: number;
  price?: number;
  status: string;
  createdAt: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
  const { selectedStock } = useMarketData();
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [depth, setDepth] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!symbol || showHistory) return;

    const fetchOrderBook = async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch(`/api/trading/orderbook?symbol=${symbol}`);
        const data = await res.json();
        setBids(data.bids || []);
        setAsks(data.asks || []);
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

  const fetchOrderHistory = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/trading/orders");
      const data = await res.json();
      if (data.success) {
        setOrderHistory(data.orders.filter((o: HistoryEntry) => o.symbol === symbol));
      }
    } catch (err) {
      console.error("Failed to fetch order history", err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        className="relative px-6 py-2 hover:bg-gray-700 transition-colors text-sm font-mono"
      >
        <div className={`absolute top-0 bottom-0 left-0 ${colorClass}`} style={{ width: `${barWidth}%` }} />
        <div className="relative grid grid-cols-3 gap-4">
          <span className={priceColor}>{order.price.toFixed(2)}</span>
          <span className="text-right text-white">{order.quantity.toFixed(4)}</span>
          <span className="text-right text-white">{order.total.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  const renderHistoryRow = (order: HistoryEntry) => (
    <div
      key={order._id}
      className="grid grid-cols-4 px-6 py-2 border-b border-gray-700 text-sm font-mono hover:bg-gray-700 text-white"
    >
      <div>{order.orderType.toUpperCase()}</div>
      <div className={clsx("text-center", order.type === "buy" ? "text-green-400" : "text-red-400")}>
        {order.type.toUpperCase()}
      </div>
      <div className="text-right">{order.price ? `$${order.price.toFixed(2)}` : "Market"}</div>
      <div className="text-right text-white">{new Date(order.createdAt).toLocaleString()}</div>
    </div>
  );

  return (
    <Card className="bg-gray-900 border border-gray-700 w-full max-w-5xl mx-auto shadow-md rounded-2xl">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between p-6">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
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
              <option key={d} value={d}>Depth: {d}</option>
            ))}
          </select>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => showHistory ? fetchOrderHistory() : setIsRefreshing(true)}
            className="text-white hover:text-white"
          >
            <RefreshCcw className={clsx("h-4 w-4", { "animate-spin": isRefreshing })} />
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

      <CardContent className="pb-6">
        {showHistory ? (
          <div className="px-6 space-y-2">
            {orderHistory.length > 0 ? (
              <>
                <div className="grid grid-cols-4 text-xs text-white font-semibold border-b border-gray-700 pb-1">
                  <span>Type</span>
                  <span className="text-center">Side</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Time</span>
                </div>
                {orderHistory.map(renderHistoryRow)}
              </>
            ) : (
              <div className="text-center text-white py-6 text-sm">No history for {symbol}</div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="px-6 py-2 bg-gray-800 rounded-t-lg">
              <div className="grid grid-cols-3 text-xs font-semibold text-white">
                <span>Price (USD)</span>
                <span className="text-right">Quantity</span>
                <span className="text-right">Total</span>
              </div>
            </div>

            {/* Asks */}
            {asks.length ? (
              [...asks].reverse().slice(0, depth).map((ask) => renderOrderRow(ask, "ask"))
            ) : (
              <div className="text-center text-white py-4 text-sm">No sell orders</div>
            )}

            {/* Last Price */}
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

            {/* Bids */}
            {bids.length ? (
              bids.slice(0, depth).map((bid) => renderOrderRow(bid, "bid"))
            ) : (
              <div className="text-center text-white py-4 text-sm">No buy orders</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
