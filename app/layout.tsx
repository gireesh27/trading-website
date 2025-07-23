// app/layout.tsx

import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers" // Import the wrapper

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TradeView - Professional Trading Platform",
  description: "Complete stock trading platform with real-time data, advanced charting, and portfolio management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
