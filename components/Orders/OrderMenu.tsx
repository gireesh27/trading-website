"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { GetOrderDetails } from "./utils/orderDetails";
import { OrderDetailsModal } from "./OrderDetailsModal";
import type  {Order} from "@/types/Order-types"


interface OrderMenuProps {
  order: Order;
  cancelOrder: (id: string) => void;
}

export function OrderMenu({ order, cancelOrder }: OrderMenuProps) {
  const [showModal, setShowModal] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);

  const handleViewDetails = async () => {
    const fetched = await GetOrderDetails(order._id);
    if (fetched) {
      setOrderData(fetched);
      setShowModal(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="bg-gray-800 border-gray-700 text-white"
          align="end"
        >
          <DropdownMenuItem
            onClick={handleViewDetails}
            className="hover:bg-gray-700 cursor-pointer"
          >
            View Details
          </DropdownMenuItem>

          {(order.status === "pending" || order.status === "partial") && (
            <DropdownMenuItem
              onClick={() => cancelOrder(order._id)}
              className="text-red-400 hover:bg-red-900/50 focus:bg-red-900/50 focus:text-red-300 cursor-pointer"
            >
              Cancel Order
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {orderData && (
        <OrderDetailsModal
          open={showModal}
          onClose={() => setShowModal(false)}
          order={orderData}
        />
      )}
    </>
  );
}
