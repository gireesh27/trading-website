"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/auth-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { MarketDataProvider } from "@/contexts/enhanced-market-data-context";
import { TradingProvider } from "@/contexts/trading-context";
import { WatchlistProvider } from "@/contexts/watchlist-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { OrderProvider } from "@/contexts/order-context";
import { SearchProvider } from "@/contexts/Search-context"; // ✅ IMPORT
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <WalletProvider>
          <MarketDataProvider>
            <SearchProvider>
              <TradingProvider>
                <OrderProvider>
                  <WatchlistProvider>
                    <NotificationProvider>
                      {children}
                      <Toaster />
                    </NotificationProvider>
                  </WatchlistProvider>
                </OrderProvider>
              </TradingProvider>
            </SearchProvider>
          </MarketDataProvider>
        </WalletProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
