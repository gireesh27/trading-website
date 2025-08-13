"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import ConfirmOrderModal from "@/components/wallet/ConfirmOrderModal";
import CancelModel from "./CancelModel";
import type { Order } from "@/types/Order-types";
import { Loader2 } from "lucide-react";
import { useOrders } from "@/contexts/order-context";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { useSession } from "next-auth/react";
export default function OrdersWidget() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedViewOrder, setSelectedViewOrder] = useState<Order | null>(
    null
  );
  const [cancel, setCancel] = useState(false);
  const [complete, setComplete] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { toast } = useToast();
  const {
    getOrder,
  } = useOrders();
const { data: session, status } = useSession();

const fetchOrders = async () => {
  if (!session?.user) return; // extra guard

  setLoading(true);
  try {
    const res = await fetch("/api/trading/orders", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch orders");
    }

    setOrders(data.orders || []);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    toast({
      title: "Failed to fetch orders",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};



useEffect(() => {
  if (status === "authenticated") {
    fetchOrders();
  }
}, [status]);
  const handleComplete = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
    setCancel(false);
    setComplete(true);
  };

  const handleCancel = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
    setComplete(false);
    setCancel(true);
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const data = await getOrder(orderId);
      if (data) {
        setSelectedViewOrder(data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      toast({ title: "Failed to load order details", variant: "destructive" });
    }
  };



  const renderOrderCard = (
    order: Order,
    showCompleteButton = false,
    showCancelButton = false
  ) => (
    <div
      key={order._id}
      onClick={() => handleViewOrder(order._id)}
      className="cursor-pointer bg-gradient-to-br from-black/50 to-black/30 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-5 hover:shadow-2xl hover:border-white/30 transition-all shadow-inner shadow-black/40"
    >
      <div className="space-y-4 text-white w-full">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold tracking-wide">
            {order.symbol.toUpperCase()}
          </p>
          <p className="text-sm text-white/60">
            {order.type.toUpperCase()} | {order.orderType.toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 text-sm">
          <p className="text-muted-foreground">Quantity:</p>
          <p className="text-white font-medium">{order.quantity}</p>

          <p className="text-muted-foreground">Price:</p>
          <p className="text-white font-medium">
            ₹{order.price?.toFixed(2) ?? "0.00"}
          </p>

          <p className="text-muted-foreground">Brokerage Fee:</p>
          <p className="text-white font-medium">
            ₹{order.feeBreakdown?.brokerage?.toFixed(2) ?? "0.00"}
          </p>

          <p className="text-muted-foreground">Convenience Fee:</p>
          <p className="text-white font-medium">
            ₹{order.feeBreakdown?.convenience?.toFixed(2) ?? "0.00"}
          </p>

          <p className="text-muted-foreground">Status:</p>
          <p
            className={`font-semibold ${
              order.status === "completed"
                ? "text-green-400"
                : order.status === "cancelled"
                ? "text-yellow-400"
                : "text-white"
            }`}
          >
            {order.status}
          </p>

          <p className="text-muted-foreground">Date:</p>
          <p className="text-white/70 italic">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
        {showCancelButton && (
          <Button
            size="sm"
            variant="destructive"
            className="rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel(order);
            }}
          >
            Cancel
          </Button>
        )}
        {showCompleteButton && (
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              handleComplete(order);
            }}
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card className="rounded-2xl shadow-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 tracking-wide animate-gradient">
          Your Orders
        </h2>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="flex bg-black/30 backdrop-blur-md border border-white/10 text-white rounded-xl p-1 gap-1 transition-all duration-300 shadow-inner">
            <TabsTrigger
              value="pending"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:shadow-md transition-all duration-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 data-[state=active]:text-blue-300"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:shadow-md transition-all duration-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 data-[state=active]:text-blue-300"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="flex-1 data-[state=active]:bg-white/10 data-[state=active]:shadow-md transition-all duration-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 data-[state=active]:text-blue-300"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>

          <div className="h-[480px] overflow-hidden">
            <TabsContent value="pending" className="h-full">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                </div>
              ) : orders.filter((o) => o.status === "pending").length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending orders.
                </p>
              ) : (
                <ScrollArea className="h-full pr-2">
                  <div className="space-y-4">
                    {orders
                      .filter((o) => o.status === "pending")
                      .map((order) => renderOrderCard(order, true, true))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="completed" className="h-full">
              {orders.filter((o) => o.status === "completed").length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No completed orders.
                </p>
              ) : (
                <ScrollArea className="h-full pr-2">
                  <div className="space-y-4">
                    {orders
                      .filter((o) => o.status === "completed")
                      .map((order) => renderOrderCard(order))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="h-full">
              {orders.filter((o) => o.status === "cancelled").length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No cancelled orders.
                </p>
              ) : (
                <ScrollArea className="h-full pr-2">
                  <div className="space-y-4">
                    {orders
                      .filter((o) => o.status === "cancelled")
                      .map((order) => renderOrderCard(order))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      {selectedOrder && complete && (
        <ConfirmOrderModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedOrder(null);
            setComplete(false);
            setCancel(false);
          }}
          orderId={selectedOrder._id}
          onSuccess={() => {
            setModalOpen(false);
            fetchOrders();
          }}
        />
      )}

      {selectedOrder && cancel && (
        <CancelModel
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedOrder(null);
            setComplete(false);
            setCancel(false);
          }}
          orderId={selectedOrder._id}
          onSuccess={() => {
            setModalOpen(false);
            fetchOrders();
          }}
        />
      )}
      {isViewModalOpen && selectedViewOrder && (
        <OrderDetailsModal
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedViewOrder(null);
          }}
          order={selectedViewOrder}
        />
      )}
    </Card>
  );
}
