"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/components/ui/use-toast";
import type { AnalyticsData, WalletContextType } from "@/types/wallet-types";
import { Transaction } from "@/types/wallet-types";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    investmentDistribution: [],
    balanceTrend: [],
    dailyPLHistory: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined },
    type: "all",
    symbol: "",
  });


  //  Fetch Wallet Transactions
  const fetchTransactions = useCallback(
    async (filters?: {
      type?: string;
      symbol?: string;
      from?: Date;
      to?: Date;
    }) => {
      try {
        const params = new URLSearchParams();

        if (filters?.type && filters.type !== "all")
          params.set("type", filters.type);
        if (filters?.symbol) params.set("symbol", filters.symbol);
        if (filters?.from) params.set("from", filters.from.toISOString());
        if (filters?.to) params.set("to", filters.to.toISOString());

        const res = await fetch(
          `/api/wallet/transactions?${params.toString()}`
        );
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.message || "Transaction fetch failed");

        setTransactions(data.transactions);
      } catch (error: any) {
        toast({
          title: "Transaction Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    []
  );

  //  Verify Wallet PIN
  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/wallet/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          title: "Invalid PIN",
          description: data.message || "PIN verification failed",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (err: any) {
      toast({
        title: "PIN Error",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Add Money to Wallet
  const addMoney = async (amount: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/wallet/add-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          title: "Top-up Failed",
          description: data.message || "Could not add money",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (err: any) {
      toast({
        title: "Add Money Error",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  //  Withdraw Funds from Wallet
  const withdraw = async (amount: number, pin: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, pin }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          title: "Withdrawal Failed",
          description: data.message || "Could not withdraw funds",
          variant: "destructive",
        });
        return false;
      }

      // Optionally refresh wallet
      // fetchWalletData();
      return true;
    } catch (err: any) {
      toast({
        title: "Withdraw Error",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions({
        type: filters.type,
        symbol: filters.symbol,
        from: filters.dateRange.from,
        to: filters.dateRange.to,
      });
    }
  }, [user, filters]);

  return (
    <WalletContext.Provider
      value={{
        isLoading,
        filters,
        setFilters,
        verifyPin,
        addMoney,
        withdraw,
        analytics,
        transactions,
        fetchTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
