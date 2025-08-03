// app/wallet/balance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletBalancePage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallet/balance");
      const data = await res.json();
      setBalance(data.walletBalance ?? 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="relative flex justify-center items-center h-[60vh] bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-2 rounded-3xl shadow-[inset_0_0_40px_#000] mt-10 overflow-hidden">
      {/* Grid background or noise layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] opacity-[0.07] pointer-events-none rounded-3xl z-0" />

      {/* Glow rings / border lines */}
      <div className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px] -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] -bottom-20 -right-20 animate-pulse" />

      <Card className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 text-white shadow-[0_8px_30px_rgba(255,255,255,0.05)] rounded-2xl px-6 py-5 w-[90%] max-w-sm transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white tracking-wide flex items-center gap-2">
            💼 Wallet Balance
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <Skeleton className="h-8 w-full rounded-md bg-white/20 animate-pulse" />
          ) : (
            <div className="text-4xl font-bold text-green-400 drop-shadow-md tracking-wide">
              ₹ {balance?.toFixed(2)}
            </div>
          )}

          <Button
            onClick={fetchBalance}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur transition-all duration-200"
          >
            🔄 Refresh Balance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
