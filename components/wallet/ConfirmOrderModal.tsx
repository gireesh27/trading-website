"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { ShieldCheck, Lock, Loader2, X, CheckCircle, EyeOff, Eye } from "lucide-react"; // Import icons

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
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!password) return;

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
        toast.error(data.error || "Invalid password or failed to confirm.");
        return;
      }

      toast.success("Order confirmed successfully!");
      setPassword("");
      onSuccess();
    } catch (error) {
      console.error("Confirmation Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    if (loading) return; // Prevent closing while loading
    setPassword("");
    setShowPassword(false);
    onClose();
  };
  return (
  <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white shadow-2xl shadow-emerald-500/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-neutral-100">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Secure Confirmation
          </DialogTitle>
          <DialogDescription className="text-neutral-400 pt-2">
            Please enter your wallet password to authorize and complete this transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirm}>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your Wallet Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pl-10 h-12 text-base bg-neutral-800 border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-4 sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !password}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-300 ease-in-out disabled:bg-emerald-600/50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Order
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}