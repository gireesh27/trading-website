"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEnhancedMarketData } from "@/contexts/enhanced-market-data-context"
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react"

export function MarketAnalysis() {
  const { marketData, isLoading } = useEnhancedMarketData()

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const gainers = marketData.filter((stock) => (stock.changePercent || 0) > 0).length
  const losers = marketData.filter((stock) => (stock.changePercent || 0) < 0).length
  const unchanged = marketData.length - gainers - losers

  const avgChange = marketData.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / marketData.length

  const totalVolume = marketData.reduce((sum, stock) => sum + (stock.volume || 0), 0)
  const totalMarketCap = marketData.reduce((sum, stock) => sum + (stock.marketCap || 0), 0)

  const marketSentiment = avgChange > 1 ? "Bullish" : avgChange < -1 ? "Bearish" : "Neutral"
  const sentimentColor = avgChange > 1 ? "bg-green-600" : avgChange < -1 ? "bg-red-600" : "bg-gray-600"

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
          Market Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Sentiment */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <span className="text-white font-medium">Market Sentiment</span>
          </div>
          <Badge className={sentimentColor}>{marketSentiment}</Badge>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">Gainers</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-white font-bold text-lg">{gainers}</p>
          </div>

          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">Losers</span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-white font-bold text-lg">{losers}</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Average Change</span>
            <span className={`font-medium ${avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {avgChange >= 0 ? "+" : ""}
              {avgChange.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total Volume</span>
            <span className="text-white font-medium">{(totalVolume / 1000000000).toFixed(1)}B</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Market Cap</span>
            <span className="text-white font-medium">₹{(totalMarketCap / 1000000000000).toFixed(1)}T</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Unchanged</span>
            <span className="text-gray-400 font-medium">{unchanged}</span>
          </div>
        </div>

        {/* Market Trend */}
        <div className="p-3 bg-gray-700 rounded-lg">
          <h4 className="text-white font-medium mb-2">Today's Trend</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Bearish</span>
                <span>Bullish</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${avgChange > 0 ? "bg-green-500" : "bg-red-500"}`}
                  style={{
                    width: `${Math.min(Math.max((avgChange + 5) * 10, 10), 90)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
