"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  ReferenceLine,
  Customized,
} from "recharts";
import { BarChart3, LineChartIcon, Activity, Pen } from "lucide-react";
import { Stock } from "@/types/trading-types";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
} from "@/components/indicator-calculations";

// TYPE DEFINITIONS
// ===================================

export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AdvancedTradingChartProps {
  symbol: string;
  name: string;
  selectedStock: Stock | null;
  chartCandlestickData: CandlestickPoint[];
  isChartLoading: boolean;
  getCandlestickData: (symbol: string, range: string, interval: string) => void;
  validRanges?: string[];
  events?: any;
}

export interface ChartData extends CandlestickPoint {
  timestamp: number;
  sma20?: number;
  sma50?: number;
  ema20?: number;
  ema50?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

type ChartType = "candlestick" | "line" | "area";
type Range = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y" | "max";
type Interval = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w" | "1M";

// MAPPINGS & DEFINITIONS
// ===================================

const rangeIntervalMap: { [key in Range]: Interval } = {
  "1d": "5m",
  "5d": "15m",
  "1mo": "1h",
  "3mo": "1d",
  "6mo": "1d",
  "1y": "1d",
  "5y": "1w",
  max: "1M",
};
const ranges: Range[] = ["1d", "5d", "1mo", "6mo", "1y", "5y", "max"];
const indicatorDefinitions = [
  { id: "sma20", name: "SMA 20", color: "#f59e0b" },
  { id: "sma50", name: "SMA 50", color: "#ef4444" },
  { id: "ema20", name: "EMA 20", color: "#10b981" },
  { id: "ema50", name: "EMA 50", color: "#06b6d4" },
];

// CUSTOM CHART COMPONENTS
// ===================================

const CustomCandle = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isBullish = close >= open;
  const color = isBullish ? "#10b981" : "#ef4444";
  const wickX = x + width / 2; // Assuming x, y, width, height are relative to the chart area

  function yScale(high: any): string | number | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <g stroke={color} fill={isBullish ? "none" : color} strokeWidth="1">
      <line x1={wickX} y1={yScale(low)} x2={wickX} y2={yScale(high)} />
      <rect x={x} y={y} width={width} height={height} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg text-xs text-white">
        <p className="font-bold mb-2">
          {new Date(data.timestamp).toLocaleString()}
        </p>
        <div className="grid grid-cols-2 gap-x-4">
          <span>Open:</span>
          <span className="text-right">${data.open?.toFixed(2)}</span>
          <span>High:</span>
          <span className="text-right text-green-400">
            ${data.high?.toFixed(2)}
          </span>
          <span>Low:</span>
          <span className="text-right text-red-400">
            ${data.low?.toFixed(2)}
          </span>
          <span>Close:</span>
          <span className="text-right">${data.close?.toFixed(2)}</span>
          <span>Volume:</span>
          <span className="text-right text-blue-400">
            {data.volume?.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const DrawnLines = ({ lines, chartRef }: { lines: any[]; chartRef: any }) => {
  if (!lines.length || !chartRef.current) return null;
  const chartState = chartRef.current.getChartLayout().main;
  const xScale = chartState.xScale;
  const yScale = chartState.yScale;

  return (
    <g>
      {lines.map((line, index) => (
        <line
          key={index}
          x1={xScale(line.start.x)}
          y1={yScale(line.start.y)}
          x2={xScale(line.end.x)}
          y2={yScale(line.end.y)}
          stroke="#a78bfa"
          strokeWidth={2}
        />
      ))}
    </g>
  );
};

// MAIN CHART COMPONENT
// ===================================

export function AdvancedTradingChart({
  symbol,
  selectedStock,
  chartCandlestickData,
  isChartLoading,
  getCandlestickData,
}: AdvancedTradingChartProps) {
  // STATE MANAGEMENT
  const chartRef = useRef<any>(null);
  const [chartType, setChartType] = useState<ChartType>("line");
  const [range, setRange] = useState<Range>("1y");
  const [enabledIndicators, setEnabledIndicators] = useState<Set<string>>(
    new Set(["ema20", "ema50"])
  );
  const [drawingMode, setDrawingMode] = useState<string | null>(null);
  const [trendLines, setTrendLines] = useState<any[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<any>(null);

  // DATA PROCESSING & INDICATOR CALCULATION
  const chartData: ChartData[] = useMemo(() => {
    if (!chartCandlestickData || chartCandlestickData.length === 0) return [];
    let data = chartCandlestickData.map((d) => ({
      ...d,
      timestamp: new Date(d.time).getTime(),
    }));

    if (enabledIndicators.has("sma20")) data = calculateSMA(data, 20);
    if (enabledIndicators.has("sma50")) data = calculateSMA(data, 50);
    if (enabledIndicators.has("ema20")) data = calculateEMA(data, 20);
    if (enabledIndicators.has("ema50")) data = calculateEMA(data, 50);

    // Always calculate these for the sub-charts
    data = calculateRSI(data, 14);
    data = calculateMACD(data);

    return data;
  }, [chartCandlestickData, enabledIndicators]);

  // HANDLERS for Chart Interaction
  const handleRangeChange = (newRange: Range) => {
    setRange(newRange);
    getCandlestickData(symbol, newRange, rangeIntervalMap[newRange]);
  };

  const getCoordinatesFromEvent = (e: any) => {
    if (!e || !e.activeLabel || !e.activePayload) return null;
    const yValue = e.activePayload[0].payload.high;
    return { x: e.activeLabel, y: yValue };
  };

  const handleMouseDown = (e: any) => {
    if (drawingMode === "trendline") {
      const coords = getCoordinatesFromEvent(e);
      if (coords) setCurrentDrawing({ start: coords, end: coords });
    }
  };

  const handleMouseMove = (e: any) => {
    if (drawingMode === "trendline" && currentDrawing) {
      const coords = getCoordinatesFromEvent(e);
      if (coords) setCurrentDrawing({ ...currentDrawing, end: coords });
    }
  };

  const handleMouseUp = () => {
    if (drawingMode === "trendline" && currentDrawing) {
      setTrendLines((prev) => [...prev, currentDrawing]);
      setCurrentDrawing(null);
      setDrawingMode(null);
    }
  };

  // RENDER LOGIC
  // ===================================
  if (!selectedStock) {
    return (
      <Card className="bg-gray-900 border-gray-700 h-[600px] flex items-center justify-center">
        <p className="text-gray-400">Select a stock to view the chart.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">
              {selectedStock.name} ({selectedStock.symbol})
            </CardTitle>
          </div>
          <Tabs defaultValue="chart" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
              <TabsTrigger value="drawing">Drawing</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                {ranges.map((r) => (
                  <Button
                    key={r}
                    variant={range === r ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRangeChange(r)}
                  >
                    {r.toUpperCase()}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={chartType === "line" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setChartType("line")}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "area" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setChartType("area")}
                  >
                    <Activity className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      chartType === "candlestick" ? "secondary" : "ghost"
                    }
                    size="icon"
                    onClick={() => setChartType("candlestick")}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="indicators" className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {indicatorDefinitions.map((ind) => (
                  <div key={ind.id} className="flex items-center space-x-2">
                    <Switch
                      id={ind.id}
                      checked={enabledIndicators.has(ind.id)}
                      onCheckedChange={() =>
                        setEnabledIndicators((prev) => {
                          const newSet = new Set(prev);
                          newSet.has(ind.id)
                            ? newSet.delete(ind.id)
                            : newSet.add(ind.id);
                          return newSet;
                        })
                      }
                    />
                    <Label htmlFor={ind.id} className="text-sm text-white">
                      {ind.name}
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="drawing" className="pt-4">
              <Button
                variant={drawingMode === "trendline" ? "secondary" : "outline"}
                size="sm"
                onClick={() =>
                  setDrawingMode(
                    drawingMode === "trendline" ? null : "trendline"
                  )
                }
              >
                <Pen className="h-4 w-4 mr-2" />
                Trend Line
              </Button>
            </TabsContent>
          </Tabs>
        </CardHeader>

        <CardContent>
          {isChartLoading ? (
            <div className="h-96 flex items-center justify-center text-gray-400">
              <Activity className="h-12 w-12 animate-pulse" />
            </div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="h-96 flex items-center justify-center text-gray-400">
              <p>No data available for this range.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                ref={chartRef}
                data={chartData}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  orientation="right"
                  domain={["dataMin - 5", "dataMax + 5"]}
                  tickFormatter={(v) =>
                    `$${typeof v === "number" ? v.toFixed(2) : v}`
                  }
                />
                <Tooltip content={<CustomTooltip />} />

                {enabledIndicators.has("sma20") && (
                  <Line
                    type="monotone"
                    dataKey="sma20"
                    stroke="#f59e0b"
                    dot={false}
                    strokeWidth={1}
                  />
                )}
                {enabledIndicators.has("sma50") && (
                  <Line
                    type="monotone"
                    dataKey="sma50"
                    stroke="#ef4444"
                    dot={false}
                    strokeWidth={1}
                  />
                )}
                {enabledIndicators.has("ema20") && (
                  <Line
                    type="monotone"
                    dataKey="ema20"
                    stroke="#10b981"
                    dot={false}
                    strokeWidth={1.5}
                  />
                )}
                {enabledIndicators.has("ema50") && (
                  <Line
                    type="monotone"
                    dataKey="ema50"
                    stroke="#06b6d4"
                    dot={false}
                    strokeWidth={1.5}
                  />
                )}

                {chartType === "line" && (
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {chartType === "area" && (
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                )}
                {chartType === "candlestick" && (
                  <Bar dataKey="close" shape={<CustomCandle />} />
                )}

                <Customized
                  component={DrawnLines}
                  lines={trendLines}
                  chartRef={chartRef}
                />
                {currentDrawing && (
                  <Customized
                    component={DrawnLines}
                    lines={[currentDrawing]}
                    chartRef={chartRef}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* --- SUB-CHARTS FOR INDICATORS --- */}
      {!isChartLoading && chartData && chartData.length > 0 && (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm text-white">RSI (14)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" hide={true} />
                  <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} />
                  <Tooltip wrapperClassName="!text-xs" />
                  <ReferenceLine
                    y={70}
                    stroke="#ef4444"
                    strokeDasharray="2 2"
                  />
                  <ReferenceLine
                    y={30}
                    stroke="#10b981"
                    strokeDasharray="2 2"
                  />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="#f97316"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm text-white">
                MACD (12, 26, 9)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={100}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" hide={true} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip wrapperClassName="!text-xs" />
                  <ReferenceLine y={0} stroke="#6b7280" />
                  <Bar dataKey="histogram" fill="#6b7280" opacity={0.6} />
                  <Line
                    type="monotone"
                    dataKey="macd"
                    stroke="#3b82f6"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="signal"
                    stroke="#ef4444"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
