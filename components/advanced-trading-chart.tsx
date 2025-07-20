"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChartIcon,
  Activity,
  Volume2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  TrendingUpIcon,
  Minus,
} from "lucide-react"
import { useMarketData } from "@/contexts/enhanced-market-data-context"
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js"
import { Stock } from "@/types/trading-types"


interface CandlestickPoint {
  time: string // or number (e.g., timestamp)
  open: number
  high: number
  low: number
  close: number
}


interface CandlestickPoint {
  time: string
  open: number
  high: number
  low: number
  close: number
}
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement)

export interface AdvancedTradingChartProps {
  symbol: string
  name: string
  currentPrice: number
  chartCandlestickData: CandlestickPoint[]
  selectedStock: Stock | null
  selectStock: (stock: Stock) => void
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  activeWatchlist: string[]
  getCandlestickData: (symbol: string, timeframe?: string) => void
}



interface ChartData {
  time: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  sma20?: number
  sma50?: number
  sma200?: number
  ema12?: number
  ema26?: number
  rsi?: number
  macd?: number
  signal?: number
  histogram?: number
  bbUpper?: number
  bbMiddle?: number
  bbLower?: number
  stochK?: number
  stochD?: number
  williams?: number
  atr?: number
  adx?: number
}

type ChartType = "candlestick" | "ohlc" | "line" | "area" | "bar"
type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w" | "1M"
type RangeSelector = "1D" | "5D" | "1M" | "3M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX"

const timeframes: { value: Timeframe; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
  { value: "1M", label: "1M" },
]

const rangeSelectors: { value: RangeSelector; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "5D", label: "5D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "YTD", label: "YTD" },
  { value: "1Y", label: "1Y" },
  { value: "5Y", label: "5Y" },
  { value: "MAX", label: "MAX" },
]

// Renamed to avoid conflict with context technicalIndicators
const indicatorDefinitions = [
  { id: "sma20", name: "SMA 20", color: "#f59e0b", category: "Moving Averages" },
  { id: "sma50", name: "SMA 50", color: "#ef4444", category: "Moving Averages" },
  { id: "sma200", name: "SMA 200", color: "#8b5cf6", category: "Moving Averages" },
  { id: "ema12", name: "EMA 12", color: "#10b981", category: "Moving Averages" },
  { id: "ema26", name: "EMA 26", color: "#06b6d4", category: "Moving Averages" },
  { id: "bollinger", name: "Bollinger Bands", color: "#ec4899", category: "Volatility" },
  { id: "rsi", name: "RSI", color: "#f97316", category: "Momentum" },
  { id: "macd", name: "MACD", color: "#3b82f6", category: "Momentum" },
  { id: "stochastic", name: "Stochastic", color: "#84cc16", category: "Momentum" },
  { id: "williams", name: "Williams %R", color: "#f43f5e", category: "Momentum" },
  { id: "atr", name: "ATR", color: "#6366f1", category: "Volatility" },
  { id: "adx", name: "ADX", color: "#8b5cf6", category: "Trend" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-white text-sm font-medium mb-2">{new Date(data.time).toLocaleString()}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Open:</span>
            <span className="text-white">${data.open?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">High:</span>
            <span className="text-green-400">${data.high?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Low:</span>
            <span className="text-red-400">${data.low?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Close:</span>
            <span className="text-white">${data.close?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Volume:</span>
            <span className="text-blue-400">{data.volume?.toLocaleString() || "0"}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function AdvancedTradingChart({
  symbol,
  name,
  currentPrice,
  chartCandlestickData,
  selectedStock,
  selectStock,
  addToWatchlist,
  removeFromWatchlist,
  activeWatchlist,
  getCandlestickData,
}: AdvancedTradingChartProps) {
  const { technicalIndicators, isLoading } = useMarketData();

  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");
  const [rangeSelector, setRangeSelector] = useState<RangeSelector>("1M");
  const [showVolume, setShowVolume] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [enabledIndicators, setEnabledIndicators] = useState<Set<string>>(new Set(["sma20", "sma50"]));
  const [drawingMode, setDrawingMode] = useState<string | null>(null);
  const [trendLines, setTrendLines] = useState<any[]>([]);

  const chartData: ChartData[] = useMemo(() => {
    if (!chartCandlestickData || chartCandlestickData.length === 0) return [];

    return chartCandlestickData.map((item, index) => {
      const data: ChartData = {
        ...item,
        timestamp: new Date(item.time).getTime(),
        time: "",
        volume: 0
      };

      // Add technical indicators with null checks
      if (technicalIndicators) {
        const {
          sma20,
          sma50,
          ema12,
          ema26,
          rsi,
          macd,
          bollingerBands,
          stochastic,
          williams,
          atr,
          adx,
        } = technicalIndicators;

        if (sma20 && sma20[index] !== undefined) data.sma20 = sma20[index];
        if (sma50 && sma50[index] !== undefined) data.sma50 = sma50[index];
        if (ema12 && ema12[index] !== undefined) data.ema12 = ema12[index];
        if (ema26 && ema26[index] !== undefined) data.ema26 = ema26[index];
        if (rsi && rsi[index] !== undefined) data.rsi = rsi[index];
        if (macd?.macd?.[index] !== undefined) data.macd = macd.macd[index];
        if (macd?.signal?.[index] !== undefined) data.signal = macd.signal[index];
        if (macd?.histogram?.[index] !== undefined) data.histogram = macd.histogram[index];
        if (bollingerBands?.upper?.[index] !== undefined) data.bbUpper = bollingerBands.upper[index];
        if (bollingerBands?.middle?.[index] !== undefined) data.bbMiddle = bollingerBands.middle[index];
        if (bollingerBands?.lower?.[index] !== undefined) data.bbLower = bollingerBands.lower[index];
        if (stochastic?.k?.[index] !== undefined) data.stochK = stochastic.k[index];
        if (stochastic?.d?.[index] !== undefined) data.stochD = stochastic.d[index];
        if (williams?.[index] !== undefined) data.williams = williams[index];
        if (atr?.[index] !== undefined) data.atr = atr[index];
        if (adx?.[index] !== undefined) data.adx = adx[index];

        // Calculate SMA 200 manually if enough data
        if (index >= 199 && chartCandlestickData.length > 199) {
          const sma200 =
            chartCandlestickData.slice(index - 199, index + 1).reduce((sum, d) => sum + d.close, 0) / 200;
          data.sma200 = sma200;
        }
      }

      return data;
    });
  }, [chartCandlestickData, technicalIndicators]);
  
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
    if (selectedStock) {
      getCandlestickData(selectedStock.symbol, newTimeframe)
    }
  }

  const handleRangeSelectorChange = (range: RangeSelector) => {
    setRangeSelector(range)
    // Implement range-based data filtering
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  const toggleIndicator = (indicatorId: string) => {
    setEnabledIndicators((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(indicatorId)) {
        newSet.delete(indicatorId)
      } else {
        newSet.add(indicatorId)
      }
      return newSet
    })
  }

  const renderMainChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading chart data...</p>
          </div>
        </div>
      )
    }

    const visibleData = chartData.slice(-Math.floor(100 / zoomLevel))

    const commonProps = {
      data: visibleData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    }

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleDateString()}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} />
              {renderIndicators()}
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleDateString()}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              {renderIndicators()}
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleDateString()}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="close" fill="#3b82f6" />
              {renderIndicators()}
            </ComposedChart>
          </ResponsiveContainer>
        )

      case "candlestick":
      case "ohlc":
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleDateString()}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              {renderIndicators()}
              {showVolume && <Bar dataKey="volume" fill="#6b7280" opacity={0.3} yAxisId="volume" />}
            </ComposedChart>
          </ResponsiveContainer>
        )
    }
  }

  const renderIndicators = () => {
    const indicators = []

    if (enabledIndicators.has("sma20")) {
      indicators.push(
        <Line
          key="sma20"
          type="monotone"
          dataKey="sma20"
          stroke="#f59e0b"
          strokeWidth={1}
          dot={false}
          strokeDasharray="5 5"
        />,
      )
    }

    if (enabledIndicators.has("sma50")) {
      indicators.push(
        <Line
          key="sma50"
          type="monotone"
          dataKey="sma50"
          stroke="#ef4444"
          strokeWidth={1}
          dot={false}
          strokeDasharray="5 5"
        />,
      )
    }

    if (enabledIndicators.has("sma200")) {
      indicators.push(
        <Line
          key="sma200"
          type="monotone"
          dataKey="sma200"
          stroke="#8b5cf6"
          strokeWidth={1}
          dot={false}
          strokeDasharray="5 5"
        />,
      )
    }

    if (enabledIndicators.has("ema12")) {
      indicators.push(<Line key="ema12" type="monotone" dataKey="ema12" stroke="#10b981" strokeWidth={1} dot={false} />)
    }

    if (enabledIndicators.has("ema26")) {
      indicators.push(<Line key="ema26" type="monotone" dataKey="ema26" stroke="#06b6d4" strokeWidth={1} dot={false} />)
    }

    if (enabledIndicators.has("bollinger")) {
      indicators.push(
        <Line
          key="bbUpper"
          type="monotone"
          dataKey="bbUpper"
          stroke="#ec4899"
          strokeWidth={1}
          dot={false}
          strokeDasharray="2 2"
        />,
        <Line key="bbMiddle" type="monotone" dataKey="bbMiddle" stroke="#ec4899" strokeWidth={1} dot={false} />,
        <Line
          key="bbLower"
          type="monotone"
          dataKey="bbLower"
          stroke="#ec4899"
          strokeWidth={1}
          dot={false}
          strokeDasharray="2 2"
        />,
      )
    }

    return indicators
  }

  const renderVolumeChart = () => {
    if (!showVolume || !chartData || chartData.length === 0) return null

    return (
      <Card className="bg-gray-900 border-gray-700 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={chartData.slice(-Math.floor(100 / zoomLevel))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleDateString()}
                stroke="#9ca3af"
                fontSize={10}
              />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Bar dataKey="volume" fill="#6b7280" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const renderIndicatorCharts = () => {
    if (!chartData || chartData.length === 0) return []

    const indicatorCharts = []

    if (enabledIndicators.has("rsi")) {
      indicatorCharts.push(
        <Card key="rsi" className="bg-gray-900 border-gray-700 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">RSI (14)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData.slice(-Math.floor(100 / zoomLevel))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleDateString()}
                  stroke="#9ca3af"
                  fontSize={10}
                />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="rsi" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>,
      )
    }

    if (enabledIndicators.has("macd")) {
      indicatorCharts.push(
        <Card key="macd" className="bg-gray-900 border-gray-700 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">MACD (12, 26, 9)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <ComposedChart data={chartData.slice(-Math.floor(100 / zoomLevel))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleDateString()}
                  stroke="#9ca3af"
                  fontSize={10}
                />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <ReferenceLine y={0} stroke="#6b7280" />
                <Bar dataKey="histogram" fill="#6b7280" opacity={0.6} />
                <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="signal" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>,
      )
    }

    if (enabledIndicators.has("stochastic")) {
      indicatorCharts.push(
        <Card key="stochastic" className="bg-gray-900 border-gray-700 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Stochastic (14, 3, 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData.slice(-Math.floor(100 / zoomLevel))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleDateString()}
                  stroke="#9ca3af"
                  fontSize={10}
                />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="2 2" />
                <ReferenceLine y={20} stroke="#10b981" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="stochK" stroke="#84cc16" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stochD" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>,
      )
    }

    return indicatorCharts
  }

  if (!selectedStock) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a stock to view advanced chart</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-white text-xl">{selectedStock.symbol}</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">${(selectedStock.price || 0).toFixed(2)}</span>
                <Badge
                  variant={(selectedStock.change || 0) >= 0 ? "default" : "destructive"}
                  className={(selectedStock.change || 0) >= 0 ? "bg-green-600" : "bg-red-600"}
                >
                  {(selectedStock.change || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {(selectedStock.change || 0).toFixed(2)} ({(selectedStock.changePercent || 0).toFixed(2)}%)
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chart Controls */}
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="main" className="text-white">
                Chart
              </TabsTrigger>
              <TabsTrigger value="indicators" className="text-white">
                Indicators
              </TabsTrigger>
              <TabsTrigger value="drawing" className="text-white">
                Drawing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              {/* Chart Type & Timeframe */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={chartType === "candlestick" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("candlestick")}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Candles
                  </Button>
                  <Button
                    variant={chartType === "ohlc" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("ohlc")}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    OHLC
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <LineChartIcon className="h-4 w-4 mr-1" />
                    Line
                  </Button>
                  <Button
                    variant={chartType === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("area")}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Activity className="h-4 w-4 mr-1" />
                    Area
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Bar
                  </Button>
                </div>

                {/* Range Selector */}
                <div className="flex items-center space-x-1">
                  {rangeSelectors.map((range) => (
                    <Button
                      key={range.value}
                      variant={rangeSelector === range.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRangeSelectorChange(range.value)}
                      className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Timeframes */}
              <div className="flex items-center space-x-1">
                {timeframes.map((tf) => (
                  <Button
                    key={tf.value}
                    variant={timeframe === tf.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeframeChange(tf.value)}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>

              {/* Chart Options */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch id="volume" checked={showVolume} onCheckedChange={setShowVolume} />
                  <Label htmlFor="volume" className="text-white text-sm">
                    <Volume2 className="h-4 w-4 inline mr-1" />
                    Volume
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="crosshair" checked={showCrosshair} onCheckedChange={setShowCrosshair} />
                  <Label htmlFor="crosshair" className="text-white text-sm">
                    <Crosshair className="h-4 w-4 inline mr-1" />
                    Crosshair
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="indicators" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicatorDefinitions.map((indicator) => (
                  <div key={indicator.id} className="flex items-center space-x-2">
                    <Switch
                      id={indicator.id}
                      checked={enabledIndicators.has(indicator.id)}
                      onCheckedChange={() => toggleIndicator(indicator.id)}
                    />
                    <Label htmlFor={indicator.id} className="text-white text-sm">
                      <span
                        className="inline-block w-3 h-3 rounded mr-2"
                        style={{ backgroundColor: indicator.color }}
                      ></span>
                      {indicator.name}
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="drawing" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={drawingMode === "trendline" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDrawingMode(drawingMode === "trendline" ? null : "trendline")}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  Trend Line
                </Button>
                <Button
                  variant={drawingMode === "fibonacci" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDrawingMode(drawingMode === "fibonacci" ? null : "fibonacci")}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Fibonacci
                </Button>
                <Button
                  variant={drawingMode === "rectangle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDrawingMode(drawingMode === "rectangle" ? null : "rectangle")}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Rectangle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrendLines([])}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Clear All
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>Loading advanced chart data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {renderMainChart()}

              {/* Mini Navigator Chart */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={1} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume Chart */}
      {renderVolumeChart()}

      {/* Technical Indicator Charts */}
      {renderIndicatorCharts()}
    </div>
  )
}