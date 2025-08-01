"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/Order-types";

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal = ({ open, onClose, order }: OrderDetailsModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl">Order Details</DialogTitle>
          <DialogDescription className="text-gray-400">
            Order ID: <span className="break-all">{order._id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm font-mono">
          <Detail label="Symbol" value={order.symbol} />
          <Detail
            label="Type"
            value={
              <Badge
                variant={order.type === "buy" ? "default" : "destructive"}
              >
                {order.type.toUpperCase()}
              </Badge>
            }
          />
          <Detail label="Order Type" value={order.orderType} />
          <Detail label="Status" value={order.status} />
          <Detail label="Quantity" value={order.quantity} />
          <Detail label="Price" value={order.price ? `$${order.price}` : "Market"} />
          
          <Detail
            label="Created At"
            value={new Date(order.createdAt).toLocaleString()}
          />
          <Detail
            label="Updated At"
            value={new Date(order.updatedAt).toLocaleString()}
          />
        </div>

        <DialogClose asChild>
          <Button variant="secondary" className="w-full mt-4">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};


const Detail = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between gap-4">
    <span className="text-gray-400">{label}</span>
    <span className="text-right text-white">{value}</span>
  </div>
);
