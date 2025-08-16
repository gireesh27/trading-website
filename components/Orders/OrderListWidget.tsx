"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Calendar, CheckCircle, IndianRupee, Loader2, Package, History } from "lucide-react";
import { Badge } from "../ui/badge";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  return (
 <div className="mt-6 w-full max-w-xl mx-auto">
      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <History className="w-7 h-7 text-cyan-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Completed Orders
          </h2>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-4">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
            <p>Loading Orders...</p>
          </div>
        ) : completedOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-4">
            <CheckCircle size={40} />
            <p>No completed orders found.</p>
            <p className="text-sm">Your past trades will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[26rem] overflow-y-auto pr-2 custom-scrollbar">
            {remainingItems.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-slate-800/60 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-bold text-lg text-slate-100">{order.symbol.toUpperCase()}</span>
                    <div className="text-xs capitalize text-slate-400">{order.orderType} Order</div>
                  </div>
                  <Badge variant="outline" className={`capitalize ${order.type === 'buy' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                    {order.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package size={14} />
                    <div>
                      Qty: <span className="font-medium text-slate-200">{order.quantity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <IndianRupee size={14} />
                    <div>
                      Price: <span className="font-medium text-slate-200">₹{order.price?.toFixed(2) ?? '0.00'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-2 flex items-center justify-end gap-2 text-xs text-slate-500">
                  <Calendar size={12} />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
