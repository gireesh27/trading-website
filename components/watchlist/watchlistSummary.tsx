"use client"
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { useWatchlist } from '@/contexts/watchlist-context'

export function WatchlistSummary() {
  const { activeWatchlist } = useWatchlist()

  const summary = useMemo(() => {
    if (!activeWatchlist || activeWatchlist.items.length === 0) {
      return null
    }

    const items = activeWatchlist.items
    const totalValue = items.reduce((sum, item) => sum + (item.price * 100), 0) // Assuming 100 shares each
    const totalChange = items.reduce((sum, item) => sum + item.change, 0)
    const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100

    const gainers = items.filter(item => item.changePercent > 0)
    const losers = items.filter(item => item.changePercent < 0)
    const unchanged = items.filter(item => item.changePercent === 0)

    const topGainer = items.reduce((max, item) => 
      item.changePercent > max.changePercent ? item : max
    )
    
    const topLoser = items.reduce((min, item) => 
      item.changePercent < min.changePercent ? item : min
    )


    return {
      totalValue,
      totalChange,
      totalChangePercent,
      gainers: gainers.length,
      losers: losers.length,
      unchanged: unchanged.length,
      topGainer,
      topLoser,
      totalItems: items.length
    }
  }, [activeWatchlist])

  if (!summary) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Add symbols to see summary</p>
        </CardContent>
      </Card>
    )
  }

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Watchlist Summary</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Performance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Total Value</span>
            </div>
            <p className="text-white text-lg font-semibold">
              ${formatLargeNumber(summary.totalValue)}
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              {summary.totalChangePercent >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-gray-400 text-sm">Total Change</span>
            </div>
            <div className={`text-lg font-semibold ${
              summary.totalChangePercent >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {summary.totalChangePercent >= 0 ? '+' : ''}
              {summary.totalChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Gainers/Losers Distribution */}
        <div className="space-y-2">
          <h4 className="text-gray-300 text-sm font-medium">Distribution</h4>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600 hover:bg-green-600">
              {summary.gainers} Gainers
            </Badge>
            <Badge className="bg-red-600 hover:bg-red-600">
              {summary.losers} Losers
            </Badge>
            {summary.unchanged > 0 && (
              <Badge variant="secondary">
                {summary.unchanged} Unchanged
              </Badge>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-3">
          <h4 className="text-gray-300 text-sm font-medium">Top Performers</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-green-900/20 rounded">
              <div>
                <span className="text-green-400 text-sm font-medium">Top Gainer</span>
                <p className="text-white text-sm">{summary.topGainer.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-semibold">
                  +{summary.topGainer.changePercent.toFixed(2)}%
                </p>
                <p className="text-gray-400 text-xs">
                  ${summary.topGainer.price.toFixed(2)}
                </p>
              </div>
            </div>

            {summary.topLoser.changePercent < 0 && (
              <div className="flex items-center justify-between p-2 bg-red-900/20 rounded">
                <div>
                  <span className="text-red-400 text-sm font-medium">Top Loser</span>
                  <p className="text-white text-sm">{summary.topLoser.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-semibold">
                    {summary.topLoser.changePercent.toFixed(2)}%
                  </p>
                  <p className="text-gray-400 text-xs">
                    ${summary.topLoser.price.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Total Symbols</p>
            <p className="text-white text-sm font-medium">
              {summary.totalItems}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
