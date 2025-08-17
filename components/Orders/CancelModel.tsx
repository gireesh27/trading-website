import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/Order-types";
import { useOrders } from "@/contexts/order-context";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
export interface CancelModelProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

const CancelModel = ({
  open,
  onClose,
  orderId,
  onSuccess,
}: CancelModelProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { getOrder, cancelOrder } = useOrders();

useEffect(() => {
  if (open && orderId) {
    getOrder(orderId)
      .then((data) => setOrder(data))
      .catch(() => {
        toast.error("Failed to load order");
      });
  }
}, [open, orderId]);

const handleConfirmCancel = async () => {
  try {
    setLoading(true);
    const success = await cancelOrder(orderId);

    if (success) {
      toast.success(`Order for ${order?.symbol} has been cancelled.`);
      onSuccess();
      onClose();
    } else {
      toast.error("Cancellation failed. Please try again.");
    }
  } catch (err) {
    toast.error("An error occurred while cancelling the order.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
        </DialogHeader>

        {!order ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 text-sm text-white">
            <p className="text-base font-medium">
              Are you sure you want to{" "}
              <span className="text-red-400 font-semibold">cancel</span> this
              order for{" "}
              <span className="text-indigo-400 font-semibold uppercase">
                {order.symbol}
              </span>
              ?
            </p>

            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 p-4 shadow-inner backdrop-blur-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium uppercase">{order.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Type</span>
                <span className="font-medium uppercase">{order.orderType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              {order.price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Limit Price</span>
                  <span className="font-medium">₹{order.price.toFixed(2)}</span>
                </div>
              )}
              {order.stopPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Price</span>
                  <span className="font-medium">
                    ₹{order.stopPrice.toFixed(2)}
                  </span>
                </div>
              )}
              {order.targetPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Price</span>
                  <span className="font-medium">
                    ₹{order.targetPrice.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold capitalize text-yellow-400">
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelModel;
