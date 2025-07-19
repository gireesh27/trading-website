"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useMarketData } from "@/contexts/enhanced-market-data-context"

export function MarketTicker({ symbol, name, price, change, changePercent, volume }: any) {
  const { stocks: marketData, selectStock } = useMarketData()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (marketData.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % marketData.length) // Use stocks.length
    }, 3000)

    return () => clearInterval(interval)
  }, [marketData.length])

  if (!marketData || marketData.length === 0) {
    return (
      <Card className="p-4 bg-gray-900 border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading market data...</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-gray-900 border-gray-700 overflow-hidden">
      <div className="flex items-center space-x-6 animate-scroll">
        {marketData.map((stock: { symbol: string; name: string; price: any; change: any; changePercent: any }, index: any) => (
          <div 
            key={stock.symbol}
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors min-w-fit"
            onClick={() => selectStock(stock.symbol)}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm">{stock.symbol}</span>
              <span className="text-xs text-gray-400">{stock.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bold text-white">${(stock.price || 0).toFixed(2)}</span>
              <Badge
                variant={(stock.change || 0) >= 0 ? "default" : "destructive"}
                className={`text-xs ${
                  (stock.change || 0) >= 0 ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {(stock.change || 0) >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {(stock.changePercent || 0).toFixed(2)}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
