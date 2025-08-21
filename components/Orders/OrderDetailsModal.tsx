"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Package, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Hash, 
    Tag, 
    CheckCircle, 
    Clock, 
    Calendar, 
    Info,
    X 
} from "lucide-react";
import type { Order } from "@/types/Order-types";

// NOTE: You'll need to install lucide-react
// npm install lucide-react

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal = ({ open, onClose, order }: OrderDetailsModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-neutral-950 text-neutral-200 border-neutral-800 shadow-2xl shadow-cyan-500/10 sm:rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Package className="h-6 w-6 text-cyan-400" />
            Order Details
          </DialogTitle>
          <DialogDescription className="text-neutral-500 pt-1">
            Order ID: <span className="font-mono break-all">{order._id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Details Section */}
        <div className="py-4 space-y-4">
          <div className="bg-neutral-900/70 p-4 border border-neutral-800 rounded-lg space-y-3">
            <Detail icon={<Tag className="text-cyan-400"/>} label="Symbol" value={order.symbol} />
            <Detail 
                icon={order.type === "buy" ? <ArrowUpRight className="text-green-400" /> : <ArrowDownLeft className="text-red-400" />}
                label="Type" 
                value={<TypeBadge type={order.type} />} 
            />
            <Detail icon={<Info className="text-cyan-400"/>} label="Order Type" value={order.orderType} />
            <Detail 
                icon={<CheckCircle className="text-cyan-400"/>} 
                label="Status" 
                value={<StatusBadge status={order.status} />} 
            />
          </div>
          <div className="bg-neutral-900/70 p-4 border border-neutral-800 rounded-lg space-y-3">
            <Detail icon={<Hash className="text-cyan-400"/>} label="Quantity" value={order.quantity} />
            <Detail icon={<Tag className="text-cyan-400"/>} label="Price" value={order.price ? `$${order.price.toFixed(2)}` : "Market"} />
            <Detail
              icon={<Calendar className="text-cyan-400"/>}
              label="Created At"
              value={new Date(order.createdAt).toLocaleString()}
            />
            <Detail
              icon={<Clock className="text-cyan-400"/>}
              label="Updated At"
              value={new Date(order.updatedAt).toLocaleString()}
            />
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
            <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full bg-neutral-900/50 border-neutral-700 hover:bg-neutral-800 hover:text-white transition-all duration-300 group"
            >
                <X className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90"/>
                Close
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Styled Sub-components ---

const Detail = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 flex-shrink-0">{icon}</div>
      <span className="text-neutral-400">{label}</span>
    </div>
    <span className="font-semibold text-right text-neutral-100">{value}</span>
  </div>
);

const TypeBadge = ({ type }: { type: "buy" | "sell" }) => (
  <Badge
    className={`font-bold text-xs uppercase tracking-wider border ${
      type === "buy"
        ? "bg-green-500/10 text-green-400 border-green-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20"
    }`}
  >
    {type}
  </Badge>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    default: "bg-neutral-700/20 text-neutral-400 border-neutral-700/30",
  };
  const style = statusStyles[status.toLowerCase()] || statusStyles.default;

  return (
    <Badge className={`font-semibold text-xs capitalize tracking-wide border ${style}`}>
      {status}
    </Badge>
  );
};
