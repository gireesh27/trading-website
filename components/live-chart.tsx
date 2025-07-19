"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react"

interface ChartData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface LiveChartProps {
  symbol: string
  data: ChartData[]
  currentPrice: number
  change: number
  changePercent: number
}

export function LiveChart({ symbol, data, currentPrice, change, changePercent }: LiveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeframe, setTimeframe] = useState("1D")
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick")

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.fillStyle = "#1f2937"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Calculate price range
    const prices = data.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Chart dimensions
    const padding = 40
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    // Draw grid lines
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice - (priceRange / 5) * i
      ctx.fillStyle = "#9ca3af"
      ctx.font = "12px Inter"
      ctx.textAlign = "right"
      ctx.fillText(price.toFixed(2), padding - 5, y + 4)
    }

    // Vertical grid lines
    const timeStep = Math.max(1, Math.floor(data.length / 6))
    for (let i = 0; i < data.length; i += timeStep) {
      const x = padding + (chartWidth / (data.length - 1)) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, rect.height - padding)
      ctx.stroke()
    }

    if (chartType === "candlestick") {
      // Draw candlesticks
      const candleWidth = Math.max(2, (chartWidth / data.length) * 0.8)

      data.forEach((candle, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index
        const openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight
        const closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight
        const highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight
        const lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight

        const isGreen = candle.close > candle.open

        // Draw wick
        ctx.strokeStyle = isGreen ? "#10b981" : "#ef4444"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, highY)
        ctx.lineTo(x, lowY)
        ctx.stroke()

        // Draw body
        ctx.fillStyle = isGreen ? "#10b981" : "#ef4444"
        const bodyHeight = Math.abs(closeY - openY)
        const bodyY = Math.min(openY, closeY)
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 1)
      })
    } else {
      // Draw line chart
      ctx.strokeStyle = change >= 0 ? "#10b981" : "#ef4444"
      ctx.lineWidth = 2
      ctx.beginPath()

      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index
        const y = padding + ((maxPrice - point.close) / priceRange) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Fill area under line
      ctx.lineTo(padding + chartWidth, rect.height - padding)
      ctx.lineTo(padding, rect.height - padding)
      ctx.closePath()

      const gradient = ctx.createLinearGradient(0, padding, 0, rect.height - padding)
      gradient.addColorStop(0, change >= 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)")
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)")
      ctx.fillStyle = gradient
      ctx.fill()
    }
  }, [data, chartType, symbol])

  const timeframes = ["1D", "1W", "1M", "3M", "1Y"]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              {symbol}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</span>
              <div className={`flex items-center ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                <span className="font-medium">
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-700 rounded-lg p-1">
              <Button
                size="sm"
                variant={chartType === "candlestick" ? "default" : "ghost"}
                onClick={() => setChartType("candlestick")}
                className="h-8 px-3"
              >
                <Activity className="h-3 w-3 mr-1" />
                Candles
              </Button>
              <Button
                size="sm"
                variant={chartType === "line" ? "default" : "ghost"}
                onClick={() => setChartType("line")}
                className="h-8 px-3"
              >
                Line
              </Button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? "default" : "ghost"}
              onClick={() => setTimeframe(tf)}
              className="h-8 px-3 text-xs"
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <canvas ref={canvasRef} className="w-full h-96 rounded-lg" style={{ background: "#1f2937" }} />
          {data.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400">Loading chart data...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
