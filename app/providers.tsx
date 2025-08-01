"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/auth-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { MarketDataProvider } from "@/contexts/enhanced-market-data-context";
import { WatchlistProvider } from "@/contexts/watchlist-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { OrderProvider } from "@/contexts/order-context";
import { SearchProvider } from "@/contexts/Search-context";
import { Toaster } from "@/components/ui/toaster";
import RazorpayLoader from "@/components/razorpay/RazorpayLoader"; // ✅ Import here

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <WalletProvider>
          <MarketDataProvider>
            <SearchProvider>
              <OrderProvider>
                <WatchlistProvider>
                  <NotificationProvider>
                    {/* ✅ Razorpay Script */}
                    <RazorpayLoader />
                    {children}
                    <Toaster />
                  </NotificationProvider>
                </WatchlistProvider>
              </OrderProvider>
            </SearchProvider>
          </MarketDataProvider>
        </WalletProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
