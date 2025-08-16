"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface Order {
  _id: string;
  symbol: string;
  type: string;
  orderType: string;
  quantity: number;
  price?: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

export default function CompletedOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const fetchOrders = async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/trading/orders", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchOrders();
  }, [status]);

  const completedOrders = orders.filter((o) => o.status === "completed");
  const remainingItems = completedOrders;

  return (
    <div className="mt-6 space-y-3 w-full max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
       Your Completed Orders
      </h2>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">
          Loading orders...
        </div>
      ) : completedOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No completed orders found.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Scrollable remaining orders */}
          {remainingItems.length > 0 && (
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 smooth-scroll">
              {remainingItems.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition cursor-pointer"
                >
                  <div className="font-bold text-white">{order.symbol.toUpperCase()}</div>
                  <div className="text-sm text-gray-300 text-right space-y-1">
                    <div>
                      {order.type.toUpperCase()} | {order.orderType.toUpperCase()}
                    </div>
                    <div>Qty: {order.quantity} | Price: ₹{order.price?.toFixed(2) ?? "0.00"}</div>
                    <div className="text-xs text-gray-400 italic">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
