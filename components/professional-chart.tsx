"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEnhancedMarketData } from "@/contexts/enhanced-market-data-context"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, BarChart3, Volume2 } from "lucide-react"

type ChartType = "candlestick" | "line" | "area" | "ohlc"
type TimeFrame = "1min" | "5min" | "15min" | "30min" | "1hour" | "1day" | "1week" | "1month"

interface TechnicalIndicator {
  name: string
  enabled: boolean
  color: string
}

export function ProfessionalChart() {
  const { marketData, selectedStock, chartData, selectStock, getStockChart, isLoading } = useEnhancedMarketData()
  const [chartType, setChartType] = useState<ChartType>("line")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1day")
  const [showVolume, setShowVolume] = useState(true)
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([
    { name: "SMA 20", enabled: false, color: "#ff6b6b" },
    { name: "SMA 50", enabled: false, color: "#4ecdc4" },
    { name: "EMA 12", enabled: false, color: "#45b7d1" },
    { name: "Bollinger Bands", enabled: false, color: "#96ceb4" },
  ])

  const currentStock = selectedStock || (marketData.length > 0 ? marketData[0] : null)

  useEffect(() => {
    if (currentStock && !selectedStock) {
      selectStock(currentStock.symbol)
    }
  }, [currentStock, selectedStock, selectStock])

  useEffect(() => {
    if (currentStock) {
      getStockChart(currentStock.symbol, timeFrame)
    }
  }, [currentStock, timeFrame, getStockChart])

  // Generate technical indicators data
  const chartDataWithIndicators = useMemo(() => {
    if (!chartData || chartData.length === 0) return []

    return chartData.map((item, index) => {
      const result: any = {
        timestamp: item.timestamp,
        time: new Date(item.timestamp).toLocaleTimeString(),
        price: item.close,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }

      // Add SMA 20
      if (index >= 19) {
        const sma20 = chartData.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20
        result.sma20 = sma20
      }

      // Add SMA 50
      if (index >= 49) {
        const sma50 = chartData.slice(index - 49, index + 1).reduce((sum, d) => sum + d.close, 0) / 50
        result.sma50 = sma50
      }

      // Add EMA 12 (simplified calculation)
      if (index > 0) {
        const multiplier = 2 / (12 + 1)
        const prevEma = index === 1 ? item.close : (result as any).ema12 || item.close
        result.ema12 = item.close * multiplier + prevEma * (1 - multiplier)
      }

      return result
    })
  }, [chartData])

  const toggleIndicator = (indicatorName: string) => {
    setIndicators((prev) => prev.map((ind) => (ind.name === indicatorName ? { ...ind, enabled: !ind.enabled } : ind)))
  }

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </div>
      )
    }

    if (!chartDataWithIndicators || chartDataWithIndicators.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-400">No chart data available</p>
        </div>
      )
    }

    const commonProps = {
      data: chartDataWithIndicators,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#3B82F6" }}
              />
              {indicators.find((i) => i.name === "SMA 20")?.enabled && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#ff6b6b"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              {indicators.find((i) => i.name === "SMA 50")?.enabled && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#4ecdc4"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              {indicators.find((i) => i.name === "EMA 12")?.enabled && (
                <Line
                  type="monotone"
                  dataKey="ema12"
                  stroke="#45b7d1"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="3 3"
                />
              )}
              {showVolume && <Bar dataKey="volume" fill="#6B7280" opacity={0.3} yAxisId="volume" />}
            </ComposedChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              <Area type="monotone" dataKey="price" stroke="#3B82F6" fill="url(#colorPrice)" strokeWidth={2} />
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#3B82F6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  if (!currentStock) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>No stock data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = (currentStock.change || 0) >= 0

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <CardTitle className="text-white text-xl">
                {currentStock.symbol} - {currentStock.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl font-bold text-white">${(currentStock.price || 0).toFixed(2)}</span>
                <Badge className={isPositive ? "bg-green-600" : "bg-red-600"}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {isPositive ? "+" : ""}
                  {(currentStock.changePercent || 0).toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={currentStock.symbol} onValueChange={selectStock}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {marketData.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol} className="text-white">
                    {stock.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Chart Type */}
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant={chartType === "line" ? "default" : "ghost"}
              onClick={() => setChartType("line")}
              className="text-xs"
            >
              Line
            </Button>
            <Button
              size="sm"
              variant={chartType === "area" ? "default" : "ghost"}
              onClick={() => setChartType("area")}
              className="text-xs"
            >
              Area
            </Button>
            <Button
              size="sm"
              variant={chartType === "candlestick" ? "default" : "ghost"}
              onClick={() => setChartType("candlestick")}
              className="text-xs"
            >
              Candles
            </Button>
          </div>

          {/* Timeframe */}
          <div className="flex items-center space-x-1">
            {(["1min", "5min", "15min", "30min", "1hour", "1day", "1week"] as TimeFrame[]).map((tf) => (
              <Button
                key={tf}
                size="sm"
                variant={timeFrame === tf ? "default" : "ghost"}
                onClick={() => setTimeFrame(tf)}
                className="text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>

          {/* Volume Toggle */}
          <Button
            size="sm"
            variant={showVolume ? "default" : "ghost"}
            onClick={() => setShowVolume(!showVolume)}
            className="text-xs"
          >
            <Volume2 className="h-3 w-3 mr-1" />
            Volume
          </Button>
        </div>

        {/* Technical Indicators */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {indicators.map((indicator) => (
            <Button
              key={indicator.name}
              size="sm"
              variant={indicator.enabled ? "default" : "ghost"}
              onClick={() => toggleIndicator(indicator.name)}
              className="text-xs"
              style={indicator.enabled ? { backgroundColor: indicator.color } : {}}
            >
              {indicator.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {renderChart()}

          {/* Chart Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-400">Open</p>
              <p className="text-sm font-medium text-white">${(currentStock.open || 0).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">High</p>
              <p className="text-sm font-medium text-green-500">${(currentStock.high || 0).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Low</p>
              <p className="text-sm font-medium text-red-500">${(currentStock.low || 0).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Volume</p>
              <p className="text-sm font-medium text-white">{((currentStock.volume || 0) / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
