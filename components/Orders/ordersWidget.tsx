"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import type  { Order } from "@/types/Order-types";
import { OrderMenu } from "./OrderMenu";

export function OrdersWidget() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("open");
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/trading/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/trading/orders/${orderId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
      }
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "partial"
  );
  const closedOrders = orders.filter(
    (order) => order.status === "filled" || order.status === "cancelled"
  );

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600";
      case "filled":
        return "bg-green-600";
      case "cancelled":
        return "bg-red-600";
      case "partial":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "filled":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      case "partial":
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const OrderItem = ({ order }: { order: Order }) => (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
      <div className="flex items-center space-x-3">
        <div
          className={`p-1 rounded ${
            order.type === "buy" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {order.type === "buy" ? (
            <TrendingUp className="h-3 w-3 text-white" />
          ) : (
            <TrendingDown className="h-3 w-3 text-white" />
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-sm">
              {order.symbol}
            </span>
            <Badge className={`${getStatusColor(order.status)} text-xs`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{order.status}</span>
            </Badge>
          </div>

          <div className="text-xs text-gray-400">
            {order.orderType.toUpperCase()} • {order.quantity} shares
            {order.price && ` @ $${order.price.toFixed(2)}`}
          </div>

          <div className="text-xs text-gray-500">
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <OrderMenu order={order} cancelOrder={cancelOrder} />
      </div>
    </div>
  );

  return (
<Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl rounded-2xl">
  <CardHeader className="pb-3 border-b border-gray-700">
    <div className="flex items-center justify-between">
      <CardTitle className="text-white text-xl font-semibold tracking-tight flex items-center gap-2">
        📋 Orders
      </CardTitle>
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchOrders}
        disabled={isLoading}
        className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-300"
      >
        <RefreshCw
          className={`h-4 w-4 ${isLoading ? "animate-spin text-white" : ""}`}
        />
      </Button>
    </div>
  </CardHeader>

  <CardContent className="p-0">
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-[95%] mx-auto mt-4 mb-5 grid-cols-2 bg-gray-700/50 backdrop-blur-md rounded-md overflow-hidden shadow">
        <TabsTrigger
          value="open"
          className="data-[state=active]:bg-blue-600/70 data-[state=active]:text-white text-gray-300 transition-all text-sm font-medium py-2"
        >
          Open/Pending ({openOrders.length})
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="data-[state=active]:bg-purple-600/70 data-[state=active]:text-white text-gray-300 transition-all text-sm font-medium py-2"
        >
          Cancellled ({closedOrders.length})
        </TabsTrigger>
      </TabsList>

      {/* OPEN ORDERS */}
      <TabsContent value="open" className="px-4 pb-4">
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {isLoading && openOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 animate-pulse">
              Loading open orders...
            </div>
          ) : openOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">No open orders</p>
            </div>
          ) : (
            openOrders.map((order) => (
              <OrderItem key={order._id} order={order} />
            ))
          )}
        </div>
      </TabsContent>

      {/* ORDER HISTORY */}
      <TabsContent value="history" className="px-4 pb-4">
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {isLoading && closedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 animate-pulse">
              Loading order history...
            </div>
          ) : closedOrders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">No order history</p>
            </div>
          ) : (
            closedOrders.map((order) => (
              <OrderItem key={order._id} order={order} />
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>

  );
}
