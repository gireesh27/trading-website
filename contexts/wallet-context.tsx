"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { useToast } from '@/components/ui/use-toast';
import type { WalletOverview, Transaction, AnalyticsData, WalletContextType } from '@/types/wallet-types';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ dateRange: { from: undefined, to: undefined }, type: 'all', symbol: '' });

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ /* add filters here */ }).toString();
      const [overviewRes, transactionsRes, analyticsRes] = await Promise.all([
        fetch('/api/wallet/overview'),
        fetch(`/api/wallet/transactions?${query}`),
        fetch('/api/wallet/analytics')
      ]);

      if (!overviewRes.ok || !transactionsRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch wallet data.');
      }
      
      const overviewData = await overviewRes.json();
      const transactionsData = await transactionsRes.json();
      const analyticsData = await analyticsRes.json();

      if (overviewData.success) setOverview(overviewData.data);
      if (transactionsData.success) setTransactions(transactionsData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, filters]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);
  
  return (
    <WalletContext.Provider value={{ overview, transactions, analytics, isLoading, filters, setFilters, fetchWalletData }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}