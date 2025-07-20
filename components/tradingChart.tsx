"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Maximize2,
  Settings,
  RefreshCw,
  Volume2
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ChartData {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockInfo {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
}

export function TradingChart() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [timeframe, setTimeframe] = useState('1D')
  const [chartType, setChartType] = useState('candlestick')
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock stock data
  useEffect(() => {
    const mockStockInfo: StockInfo = {
      symbol: selectedSymbol,
      name: selectedSymbol === 'AAPL' ? 'Apple Inc.' : 
            selectedSymbol === 'TSLA' ? 'Tesla Inc.' :
            selectedSymbol === 'GOOGL' ? 'Alphabet Inc.' : 'Microsoft Corp.',
      price: 175.43,
      change: 2.34,
      changePercent: 1.35,
      volume: 45678900,
      marketCap: '2.75T'
    }
    setStockInfo(mockStockInfo)

    // Generate mock chart data
    const mockData: ChartData[] = []
    const basePrice = 175
    let currentPrice = basePrice

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(Date.now() - (99 - i) * 60 * 1000) // 1 minute intervals
      const volatility = 0.02
      const change = (Math.random() - 0.5) * volatility * currentPrice
      
      const open = currentPrice
      const close = currentPrice + change
      const high = Math.max(open, close) + Math.random() * 0.5
      const low = Math.min(open, close) - Math.random() * 0.5
      const volume = Math.floor(Math.random() * 1000000) + 500000

      mockData.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      })

      currentPrice = close
    }

    setChartData(mockData)
  }, [selectedSymbol, timeframe])

  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M']
  const popularSymbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'NVDA']

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  const refreshChart = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {popularSymbols.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {stockInfo && (
              <div className="flex items-center space-x-3">
                <div>
                  <div className="text-white font-semibold text-lg">
                    {formatPrice(stockInfo.price)}
                  </div>
                  <div className="text-xs text-gray-400">{stockInfo.name}</div>
                </div>
                <div className={`flex items-center space-x-1 ${
                  stockInfo.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stockInfo.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)}
                  </span>
                  <span className="text-sm">
                    ({stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshChart}
              disabled={isLoading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeframe Selection */}
        <div className="flex items-center space-x-1 mt-4">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-3 py-1 h-auto ${
                timeframe === tf 
                  ? 'bg-gray-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700 mx-4 mb-4">
            <TabsTrigger value="chart" className="text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="depth" className="text-white">
              Depth
            </TabsTrigger>
            <TabsTrigger value="trades" className="text-white">
              Trades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="px-4 pb-4">
            {/* Chart Container - This would contain your actual chart library */}
            <div className="bg-gray-900 rounded-lg p-4 h-96 flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Chart for {selectedSymbol}</p>
                <p className="text-gray-500 text-sm">
                  Integrate with TradingView, Chart.js, or similar charting library
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400">Volume</div>
                    <div className="text-white font-semibold">
                      {stockInfo && formatVolume(stockInfo.volume)}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400">Market Cap</div>
                    <div className="text-white font-semibold">
                      {stockInfo?.marketCap}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

                    <TabsContent value="depth" className="px-4 pb-4">
            <div className="bg-gray-900 rounded-lg p-4 h-96">
              <div className="text-center py-8">
                <Volume2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Order Book Depth</p>
                <p className="text-gray-500 text-sm">Real-time order book data</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades" className="px-4 pb-4">
            <div className="bg-gray-900 rounded-lg p-4 h-96">
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Recent Trades</p>
                <p className="text-gray-500 text-sm">Live trade feed</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
