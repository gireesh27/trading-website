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
    <div className="max-w-md mx-auto mt-10">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-full rounded-md" />
          ) : (
            <div className="text-3xl font-bold text-green-600">₹ {balance?.toFixed(2)}</div>
          )}
          <Button onClick={fetchBalance} className="mt-4 w-full">
            Refresh Balance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
