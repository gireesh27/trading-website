"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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
  TooltipProps,
} from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ArrowUp, ArrowDown, BarChart3, LineChartIcon, Activity, Plus, Minus, Maximize, Trash2, TrendingUp } from "lucide-react";
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import {CustomTooltip} from "./customTool-Tip"
//================================================================
// 1. TYPE DEFINITIONS & INTERFACES
//================================================================

export interface Stock {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changesPercentage?: number;
  afterHours?: number;
  afterHoursChange?: number;
}

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
  selectedStock: Stock | null;
  chartCandlestickData: CandlestickPoint[];
  isChartLoading: boolean;
  getCandlestickData: (symbol: string, range: string, interval: string) => void;
}

export interface ChartData extends CandlestickPoint {
  timestamp: number;
  isBullish: boolean;
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
type Interval = "5m" | "15m" | "30m" | "1h" | "1d" | "1w" | "1M";
type DrawingTool = "trendline" | "rectangle" | null;

//================================================================
// 2. CONSTANTS & DUMMY FUNCTIONS
//================================================================

const THEME = {
  positive: "#22c55e", // Emerald 500
  negative: "#ef4444", // Red 500
  accent: "#a78bfa",   // Violet 400
  inactive: "#6b7280", // Gray 500
};

const rangeIntervalMap: { [key in Range]: Interval } = { "1d": "5m", "5d": "15m", "1mo": "1h", "3mo": "1d", "6mo": "1d", "1y": "1d", "5y": "1w", max: "1M" };
const ranges: Range[] = ["1d", "5d", "1mo", "6mo", "1y", "5y", "max"];
const intradayIntervals: Interval[] = ["5m", "15m", "30m", "1h"];
const indicatorDefinitions = [
  { id: "sma20", name: "SMA 20", color: "#f59e0b" },
  { id: "sma50", name: "SMA 50", color: "#ef4444" },
  { id: "ema20", name: "EMA 20", color: "#6366f1" },
  { id: "ema50", name: "EMA 50", color: "#ec4899" },
];

const calculateSMA = (data: ChartData[], period: number): ChartData[] => data.map((d, i) => i < period - 1 ? d : { ...d, [`sma${period}`]: data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0) / period });
const calculateEMA = (data: ChartData[], period: number): ChartData[] => {
  const k = 2 / (period + 1);
  const key = `ema${period}`;
  let ema: number | undefined;
  return data.map((d, i) => {
    if (i < period - 1) return d;
    if (i === period - 1) ema = data.slice(0, period).reduce((acc, val) => acc + val.close, 0) / period;
    else if (ema !== undefined) ema = d.close * k + ema * (1 - k);
    return { ...d, [key]: ema };
  });
};
const calculateRSI = (data: ChartData[]): ChartData[] => data.map(d => ({...d, rsi: 50 + Math.random() * 20 - 10}));
const calculateMACD = (data: ChartData[]): ChartData[] => data.map(d => ({...d, macd: Math.random() * 0.2 - 0.1, signal: Math.random() * 0.2 - 0.1, histogram: Math.random() * 0.1 - 0.05 }));

//================================================================
// 3. HELPER & CUSTOM UI COMPONENTS
//================================================================

function StockChartHeader({ stock }: { stock: Stock | null }) {
  if (!stock) return null;
  const isPositive = stock.change && stock.change >= 0;
  const changeColor = isPositive ? `text-emerald-400` : `text-red-400`;
  const bgColor = isPositive ? `bg-emerald-500/10` : `bg-red-500/10`;
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;
  return (
    <div className="mb-4 px-1">
      <h2 className="text-2xl lg:text-3xl font-bold text-white">{stock.name} <span className="text-gray-400">({stock.symbol})</span></h2>
      <div className="flex flex-col sm:flex-row sm:items-end gap-x-4 gap-y-2 mt-2">
        <p className="text-4xl lg:text-5xl font-bold text-white">${stock.price?.toFixed(2)}</p>
        <div className={`flex items-center gap-2 ${changeColor}`}>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-lg font-semibold ${bgColor}`}>
            <ChangeIcon className="h-5 w-5" />
            <span>{stock.changesPercentage?.toFixed(2)}%</span>
          </div>
          <span className="text-lg font-semibold">{isPositive ? '+' : ''}{stock.change?.toFixed(2)} Today</span>
        </div>
      </div>
    </div>
  );
}

const DrawnShapes = ({ shapes, chartRef }: { shapes: any[]; chartRef: React.RefObject<any> }) => {
  if (!shapes.length || !chartRef.current) return null;
  const chartState = chartRef.current.getChartLayouts()?.[0];
  if (!chartState?.xMap?.scale || !chartState?.yMap?.scale) return null;
  const { xScale, yScale } = { xScale: chartState.xMap.scale, yScale: chartState.yMap.scale };
  return (
    <g>
      {shapes.map((shape, index) => {
        const startX = xScale(shape.start.x);
        const startY = yScale(shape.start.y);
        const endX = xScale(shape.end.x);
        const endY = yScale(shape.end.y);
        if ([startX, startY, endX, endY].some(v => v === undefined || isNaN(v))) return null;
        if (shape.type === 'trendline') return <line key={index} x1={startX} y1={startY} x2={endX} y2={endY} stroke={THEME.accent} strokeWidth={2} strokeDasharray={shape.isDrawing ? "4 4" : "none"} />;
        if (shape.type === 'rectangle') return <rect key={index} x={Math.min(startX, endX)} y={Math.min(startY, endY)} width={Math.abs(startX - endX)} height={Math.abs(startY - endY)} fill="rgba(167, 139, 250, 0.2)" stroke={THEME.accent} strokeWidth={1} />;
        return null;
      })}
    </g>
  );
};

//================================================================
// 5. MAIN CHART COMPONENT
//================================================================

export function AdvancedTradingChart({
  symbol,
  selectedStock,
  chartCandlestickData,
  isChartLoading,
  getCandlestickData,
}: AdvancedTradingChartProps) {
  const mainChartRef = useRef<any>(null);
  const [chartType, setChartType] = useState<ChartType>("area");
  const [range, setRange] = useState<Range>("1d");
  const [interval, setInterval] = useState<Interval>("5m");
  const [enabledIndicators, setEnabledIndicators] = useState<Set<string>>(new Set([]));
  const [drawingTool, setDrawingTool] = useState<DrawingTool>(null);
  const [drawnShapes, setDrawnShapes] = useState<any[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<any>(null);
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);

  const fullChartData: ChartData[] = useMemo(() => {
    if (!chartCandlestickData || chartCandlestickData.length === 0) return [];
    let data = chartCandlestickData.map((d) => ({ ...d, timestamp: new Date(d.time).getTime(), isBullish: d.close >= d.open }));
    data = calculateRSI(data);
    data = calculateMACD(data);
    if (enabledIndicators.has("sma20")) data = calculateSMA(data, 20);
    if (enabledIndicators.has("sma50")) data = calculateSMA(data, 50);
    if (enabledIndicators.has("ema20")) data = calculateEMA(data, 20);
    if (enabledIndicators.has("ema50")) data = calculateEMA(data, 50);
    return data;
  }, [chartCandlestickData, enabledIndicators]);

  const visibleChartData = useMemo(() => {
    if (!zoomDomain) return fullChartData;
    const [start, end] = zoomDomain;
    return fullChartData.filter(d => d.timestamp >= start && d.timestamp <= end);
  }, [fullChartData, zoomDomain]);

  useEffect(() => {
    const newInterval = rangeIntervalMap[range];
    setInterval(newInterval);
    getCandlestickData(symbol, range, newInterval);
    setZoomDomain(null);
    setDrawnShapes([]);
    setCurrentDrawing(null);
    setDrawingTool(null);
  }, [symbol, range]);

  const handleIntervalChange = (newInterval: Interval) => {
    setInterval(newInterval);
    getCandlestickData(symbol, range, newInterval);
  };

  const getCoordinatesFromEvent = (e: any) => {
    if (!e || e.activeLabel === undefined || e.chartY === undefined) return null;
    const chart = mainChartRef.current;
    const chartState = chart?.getChartLayouts()?.[0];
    if (!chartState?.yMap?.scale?.invert) return null;
    const yValue = chartState.yMap.scale.invert(e.chartY);
    return { x: e.activeLabel, y: yValue };
  };

  const handleMouseDown = (e: any) => {
    if (drawingTool && !currentDrawing && e) {
      const coords = getCoordinatesFromEvent(e);
      if (coords) setCurrentDrawing({ type: drawingTool, start: coords, end: coords, isDrawing: true });
    }
  };

  const handleMouseMove = (e: any) => {
    if (drawingTool && currentDrawing && e) {
      const coords = getCoordinatesFromEvent(e);
      if (coords) setCurrentDrawing({ ...currentDrawing, end: coords });
    }
  };

  const handleMouseUp = (e: any) => {
    if (drawingTool && currentDrawing && e) {
      const coords = getCoordinatesFromEvent(e);
      const finalShape = { ...currentDrawing, end: coords || currentDrawing.end, isDrawing: false };
      setDrawnShapes(prev => [...prev, finalShape]);
      setCurrentDrawing(null);
      setDrawingTool(null);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!fullChartData.length) return;
    const fullDomain: [number, number] = [fullChartData[0].timestamp, fullChartData[fullChartData.length - 1].timestamp];
    const [start, end] = zoomDomain ?? fullDomain;
    const center = (start + end) / 2;
    const zoomFactor = direction === 'in' ? 0.7 : 1.5;
    const newSpan = (end - start) * zoomFactor;
    let newStart = center - newSpan / 2;
    let newEnd = center + newSpan / 2;
    if (newEnd - newStart < 60000 * 5) return;
    if (newEnd - newStart > (fullDomain[1] - fullDomain[0])) setZoomDomain(null);
    else setZoomDomain([Math.max(newStart, fullDomain[0]), Math.min(newEnd, fullDomain[1])]);
  };

  if (isChartLoading) return <div className="h-[800px] flex items-center justify-center text-gray-400"><Activity className="h-12 w-12 animate-pulse" /></div>;
  if (!selectedStock) return <div className="h-[800px] flex items-center justify-center text-gray-400"><p>Select a stock to view the chart.</p></div>;

  return (
    <div className="space-y-4 bg-gray-900 text-white p-2 md:p-4 rounded-lg">
      <StockChartHeader stock={selectedStock} />
      
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-700/50 pb-4 mb-4">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {ranges.map((r) => <Button key={r} variant={range === r ? "secondary" : "ghost"} size="sm" onClick={() => setRange(r)}>{r.toUpperCase()}</Button>)}
          </div>
          {range === '1d' && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:border-l md:border-gray-700 md:ml-2 md:pl-2">
              {intradayIntervals.map((i) => <Button key={i} variant={interval === i ? "secondary" : "ghost"} size="sm" onClick={() => handleIntervalChange(i)}>{i}</Button>)}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute top-2 right-2 z-20 flex gap-1 bg-gray-900/50 backdrop-blur-sm rounded-md">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => handleZoom('in')}><Plus className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => handleZoom('out')}><Minus className="h-4 w-4" /></Button>
          </div>
          {!visibleChartData.length ? (<div className="h-[400px] flex items-center justify-center text-gray-500"><p>No data available.</p></div>) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart ref={mainChartRef} data={visibleChartData} syncId="syncedCharts" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.positive} stopOpacity={0.4}/><stop offset="95%" stopColor={THEME.positive} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="timestamp" type="number" scale="time" domain={zoomDomain ?? ["dataMin", "dataMax"]} stroke="#9ca3af" fontSize={12} allowDataOverflow tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}/>
                <YAxis stroke="#9ca3af" fontSize={12} orientation="left" domain={["auto", "auto"]} tickFormatter={(v: number) => `$${v.toFixed(2)}`} allowDataOverflow tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} />
                <Tooltip content={<CustomTooltip active={false} payload={[]} coordinate={{ x: 0, y: 0 }} accessibilityLayer={false} />} cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }} />
                {indicatorDefinitions.map(ind => enabledIndicators.has(ind.id) && <Line key={ind.id} type="monotone" dataKey={ind.id} stroke={ind.color} dot={false} strokeWidth={1.5} />)}
                {chartType === "area" && <Area type="monotone" dataKey="close" stroke={THEME.positive} strokeWidth={2} fill="url(#areaGradient)" />}
               {/* <Bar dataKey="close"shape={(props) => <CustomCandle {...props} />}isAnimationActive={false}/> */}
                {chartType === "line" && <Line type="monotone" dataKey="close" stroke={THEME.positive} strokeWidth={2} dot={false} />}
                <Customized component={DrawnShapes} shapes={[...drawnShapes, ...(currentDrawing ? [currentDrawing] : [])]} chartRef={mainChartRef} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
           <div className="flex items-center gap-2">
                <Button variant={drawingTool === 'trendline' ? "secondary" : "outline"} size="sm" onClick={() => setDrawingTool('trendline')}><TrendingUp className="h-4 w-4 mr-2" />Trendline</Button>
                <Button variant={drawingTool === 'rectangle' ? "secondary" : "outline"} size="sm" onClick={() => setDrawingTool('rectangle')}><Maximize className="h-4 w-4 mr-2" />Rectangle</Button>
                <Button variant="destructive" size="sm" onClick={() => setDrawnShapes([])}><Trash2 className="h-4 w-4 mr-2" />Clear</Button>
            </div>
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
              {indicatorDefinitions.map((ind) => (
                <div key={ind.id} className="flex items-center space-x-2"><input type="checkbox" id={ind.id} checked={enabledIndicators.has(ind.id)} onChange={() => setEnabledIndicators(p => { const n = new Set(p); n.has(ind.id) ? n.delete(ind.id) : n.add(ind.id); return n; })} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 rounded" /><label htmlFor={ind.id} className="text-sm text-white">{ind.name}</label></div>
              ))}
            </div>
        </div>
      </div>
      
      {!isChartLoading && visibleChartData.length > 0 && (
        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700/50"><CardHeader className="py-2 px-4"><CardTitle className="text-sm text-white">RSI (14)</CardTitle></CardHeader><CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={visibleChartData} syncId="syncedCharts" margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="timestamp" hide={true} /><YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} orientation="left" />
                <Tooltip wrapperClassName="!text-xs" />
                <ReferenceLine y={70} stroke={THEME.negative} strokeDasharray="2 2" /><ReferenceLine y={30} stroke={THEME.positive} strokeDasharray="2 2" />
                <Line type="monotone" dataKey="rsi" stroke="#f97316" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
          <Card className="bg-gray-800/50 border-gray-700/50"><CardHeader className="py-2 px-4"><CardTitle className="text-sm text-white">MACD (12, 26, 9)</CardTitle></CardHeader><CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={100}>
              <ComposedChart data={visibleChartData} syncId="syncedCharts" margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="timestamp" hide={true} /><YAxis stroke="#9ca3af" fontSize={10} orientation="left" />
                <Tooltip wrapperClassName="!text-xs" />
                <ReferenceLine y={0} stroke={THEME.inactive} />
                <Bar dataKey="histogram" fill={THEME.inactive} opacity={0.6} />
                <Line type="monotone" dataKey="macd" stroke="#3b82f6" dot={false} /><Line type="monotone" dataKey="signal" stroke="#ef4444" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}