"use client"

import { TrendingUp, TrendingDown, Volume2 } from "lucide-react"

interface EnhancedMarketTickerProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  onClick?: () => void
}

export function EnhancedMarketTicker({
  symbol,
  name,
  price,
  change,
  changePercent,
  volume,
  onClick,
}: EnhancedMarketTickerProps) {
  // Add safety checks for undefined values
  const safePrice = price || 0
  const safeChange = change || 0
  const safeChangePercent = changePercent || 0
  const safeVolume = volume || 0

  const isPositive = safeChange >= 0
  const changeColor = isPositive ? "text-green-500" : "text-red-500"
  const bgColor = isPositive ? "bg-green-500/10" : "bg-red-500/10"

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 ${bgColor} w-full text-left hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-white">{symbol || "N/A"}</span>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <span className={`text-sm font-bold ${changeColor}`}>
          {isPositive ? "+" : ""}
          {safeChangePercent.toFixed(2)}%
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-300 text-xs truncate">{name || "Unknown"}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-white">${safePrice.toFixed(2)}</span>
          <span className={`text-sm font-medium ${changeColor}`}>
            {isPositive ? "+" : ""}${Math.abs(safeChange).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <Volume2 className="h-3 w-3 mr-1" />
          <span>Vol: {formatVolume(safeVolume)}</span>
        </div>
      </div>
    </button>
  )
}
