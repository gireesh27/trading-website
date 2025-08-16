"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  loading: boolean;
}

export const ConfirmPasswordModal = ({
  open,
  onClose,
  onConfirm,
  loading,
}: ConfirmPasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!password) {
      setError("Password cannot be empty.");
      return;
    }
    setError("");
    onConfirm(password);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when the dialog is closed
      setPassword("");
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          {/* FIX: Removed `asChild` and moved styling classes here */}
          <DialogContent className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 shadow-2xl shadow-black/40 rounded-2xl text-white w-full max-w-md p-0">
            {/* FIX: motion.div now wraps the content inside the dialog for animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader className="p-6 border-b border-slate-800">
                <DialogTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  <ShieldCheck className="text-cyan-300" />
                  Confirm Wallet Password
                </DialogTitle>
                <DialogDescription className="text-slate-400 pt-1">
                  Please enter your password to authorize this action.
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter wallet password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "pl-10 h-12 bg-slate-800/60 border-2 border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all w-full",
                      error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    onClick={onClose}
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto h-12 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !password}
                    className="w-full sm:flex-1 h-12 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform transform text-white font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
