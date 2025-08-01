"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ConfirmOrderModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

export default function ConfirmOrderModal({
  open,
  onClose,
  orderId,
  onSuccess,
}: ConfirmOrderModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async (password: string, orderId: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/wallet/verify-wallet-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password, 
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: data.error || "Failed to confirm order",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Order completed successfully!",
        variant: "default",
      });

      setPassword("");
      onSuccess(); // triggers fetchOrders from OrdersWidget
    } catch (error) {
      console.log(error)
      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Confirm Order</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Please enter your wallet password to confirm this order.
        </p>

        <Input
          type="password"
          placeholder="Wallet Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-zinc-800"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="bg-zinc-700 hover:bg-zinc-600"
          >
            Cancel
          </Button>
          <Button onClick={() => handleConfirm(password,orderId)} disabled={loading || !password}>
            {loading ? "Verifying..." : "Confirm Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
