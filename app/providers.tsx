"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/auth-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { MarketDataProvider } from "@/contexts/enhanced-market-data-context";
import { WatchlistProvider } from "@/contexts/watchlist-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { OrderProvider } from "@/contexts/order-context";
import { SearchProvider } from "@/contexts/Search-context";
import { Toaster } from "@/components/ui/toaster";
import RazorpayLoader from "@/components/razorpay/RazorpayLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <SessionProvider>
        <AuthProvider>
          <WalletProvider>
            <MarketDataProvider>
              <SearchProvider>
                <OrderProvider>
                  <WatchlistProvider>
                    <NotificationProvider>
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
    </ClerkProvider>
  );
}
