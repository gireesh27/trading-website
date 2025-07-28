"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Order {
  _id: string;
  symbol: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop";
  quantity: number;
  price?: number;
  stopPrice?: number;
  targetPrice?: number;
  status: "pending" | "partial" | "filled" | "cancelled" | "rejected";
  filledQuantity: number;
  averagePrice?: number;
  createdAt: string;
  updatedAt: string;
  validTill?: string;
  userId: string;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  placeOrder: (orderData: Partial<Order>) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  getOrderHistory: () => Order[];
  getOpenOrders: () => Order[];
  fetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trading/orders", { method: "GET" });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast({ title: "Failed to load orders", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast({ title: "Error fetching orders", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrder = async (orderData: Partial<Order>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trading/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => [data.order, ...prev]);
        toast({
          title: "Order Placed",
          description: `${orderData.type?.toUpperCase()} order for ${orderData.quantity} ${orderData.symbol} placed.`,
        });
        return true;
      } else {
        toast({
          title: "Order Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Place order error:", error);
      toast({ title: "Network error", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trading/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
        toast({ title: "Order Cancelled" });
        return true;
      } else {
        toast({
          title: "Cancel Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast({ title: "Network error", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderHistory = () => {
    return orders.filter((order) => ["filled", "cancelled"].includes(order.status)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getOpenOrders = () => {
    return orders.filter((order) => ["pending", "partial"].includes(order.status));
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        placeOrder,
        cancelOrder,
        getOrderHistory,
        getOpenOrders,
        fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
