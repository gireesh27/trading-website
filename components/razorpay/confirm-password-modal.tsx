"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConfirmPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  loading: boolean;
}

export const ConfirmPasswordModal = ({ open, onClose, onConfirm, loading }: ConfirmPasswordModalProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!password) return;
    onConfirm(password);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Confirm Wallet Password</DialogTitle>
        </DialogHeader>
        <Input
          type="password"
          placeholder="Enter wallet password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Verifying..." : "Confirm"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
