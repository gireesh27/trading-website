import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { WalletProvider } from "@/contexts/wallet-context"
import { MarketDataProvider } from "@/contexts/enhanced-market-data-context"
import { TradingProvider } from "@/contexts/trading-context"
import { WatchlistProvider } from "@/contexts/watchlist-context"
import { NotificationProvider } from "@/contexts/notification-context" // Added back
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TradeView - Professional Trading Platform",
  description: "Complete stock trading platform with real-time data, advanced charting, and portfolio management",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <WalletProvider>
            <MarketDataProvider>
              <TradingProvider>
                <WatchlistProvider>
                  <NotificationProvider>
                    {children}
                    <Toaster />
                  </NotificationProvider>
                </WatchlistProvider>
              </TradingProvider>
            </MarketDataProvider>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
