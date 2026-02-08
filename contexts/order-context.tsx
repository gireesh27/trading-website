"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { Order, OrderContextType } from "@/types/Order-types";
import { toast } from "react-toastify";

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* --------------------------------------------------
     Fetch all orders (ONLY after authentication)
  -------------------------------------------------- */
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trading/orders", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        setOrders([]);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      toast.error(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------
     Auto-fetch when user becomes authenticated
  -------------------------------------------------- */
  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [status]);

  /* --------------------------------------------------
     Place order
  -------------------------------------------------- */
  const placeOrder = async (
    orderData: Partial<Order>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/trading/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order failed");
      }

      setOrders((prev) => [data.order, ...prev]);

      toast.success(
        `Order placed: ${orderData.type?.toUpperCase()} ${orderData.quantity} ${orderData.symbol}`
      );

      return true;
    } catch (err: any) {
      console.error("Place order error:", err);
      toast.error(err.message || "Order failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------
     Cancel order
  -------------------------------------------------- */
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trading/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Cancel failed");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: "cancelled" }
            : order
        )
      );

      toast.success("Order cancelled");
      return true;
    } catch (err: any) {
      console.error("Cancel order error:", err);
      toast.error(err.message || "Cancel failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------
     Get single order (on-demand)
  -------------------------------------------------- */
  const getOrder = async (orderId: string): Promise<Order | null> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trading/orders/${orderId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch order");
      }

      return data.order as Order;
    } catch (err) {
      console.error("Get order error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------
     Derived selectors
  -------------------------------------------------- */
  const getOrderHistory = () =>
    orders
      .filter((o) => o.status === "cancelled" || o.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

  const getOpenOrders = () =>
    orders.filter((o) => o.status === "pending");

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        fetchOrders,
        placeOrder,
        cancelOrder,
        getOrder,
        getOrderHistory,
        getOpenOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
}
