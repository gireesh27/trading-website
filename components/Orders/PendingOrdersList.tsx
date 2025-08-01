import React from "react";
import type { Order } from "@/types/Order-types";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderMenu } from "./OrderMenu";

export const PendingOrdersList = ({
  orders,
  isLoading,
  handleComplete,
  cancelOrder,
}: {
  orders: Order[];
  isLoading: boolean;
  handleComplete: (order: Order) => void;
  cancelOrder: (id: string) => void;
}) => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600";
      case "cancelled":
        return "bg-red-600";
      case "completed":
        return "bg-green-600"
      default:
        return "bg-gray-600";
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

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {isLoading && orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400 animate-pulse">
          Loading open orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No open orders</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-1 rounded ${
                  order.type === "buy" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {order.type === "buy" ? "B" : "S"}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm">{order.symbol}</span>
                  <Badge className={`${getStatusColor(order.status)} text-xs`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  {order.orderType.toUpperCase()} • {order.quantity} shares
                  {order.price && ` @ ₹${order.price.toFixed(2)}`}
                </div>
                <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => handleComplete(order)}>
                Complete
              </Button>
              <OrderMenu order={order} cancelOrder={cancelOrder} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};
