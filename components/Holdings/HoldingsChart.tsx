"use client";

import React, { useMemo, useReducer, useRef, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Line,
  Area,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart as LineChartIcon,
  AreaChart,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Settings,
  Home,
} from "lucide-react";
import dayjs from "dayjs";
import { motion } from "framer-motion";

// --- TYPES AND INTERFACES ---

interface PricePoint {
  symbol: string;
  date: string;
  close: number;
}

interface ChartData extends PricePoint {
  timestamp: number;
  formattedDate: string;
  sma?: number;
  ema?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
}

interface Indicator {
  id: "sma" | "ema" | "rsi" | "macd";
  name: string;
  enabled: boolean;
  period: number;
  color: string;
}

interface ChartState {
  chartType: "line" | "area";
  indicatorSettings: Indicator[];
  zoomDomain: [number, number] | null;
  activeSettings: string | null;
}

type ChartAction =
  | { type: "SET_CHART_TYPE"; payload: "line" | "area" }
  | { type: "TOGGLE_INDICATOR"; payload: string }
  | { type: "UPDATE_INDICATOR_PERIOD"; payload: { id: string; period: number } }
  | { type: "SET_ZOOM_DOMAIN"; payload: [number, number] }
  | { type: "RESET_VIEW" }
  | { type: "SET_ACTIVE_SETTINGS"; payload: string | null };

interface Props {
  symbol: string;
  priceHistory: PricePoint[];
  buyPrice?: number;
  sellPrice?: number;
}

// --- THEME & CONSTANTS ---

const THEME = {
  positive: "#22c55e",
  negative: "#ef4444",
  primary: "#00f0ff",
  inactive: "#6b7280",
  sma: "#f9a825",
  ema: "#f472b6",
  rsi: "#f97316",
  macd: "#8b5cf6",
};

// --- TECHNICAL INDICATOR CALCULATORS ---

const calculateSMA = (data: number[], period: number): (number | undefined)[] => {
  const sma: (number | undefined)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(undefined);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};

const calculateEMA = (data: number[], period: number): (number | undefined)[] => {
  const ema: (number | undefined)[] = [];
  const multiplier = 2 / (period + 1);
  let prevEma: number | undefined;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(undefined);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((acc, val) => acc + val, 0);
      prevEma = sum / period;
      ema.push(prevEma);
    } else if (prevEma !== undefined) {
      const currentEma = (data[i] - prevEma) * multiplier + prevEma;
      ema.push(currentEma);
      prevEma = currentEma;
    }
  }
  return ema;
};


// --- STATE MANAGEMENT (REDUCER) ---

const initialState: ChartState = {
  chartType: "line",
  indicatorSettings: [
    { id: "sma", name: "SMA", enabled: false, period: 20, color: THEME.sma },
    { id: "ema", name: "EMA", enabled: false, period: 20, color: THEME.ema },
  ],
  zoomDomain: null,
  activeSettings: null,
};

function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case "SET_CHART_TYPE":
      return { ...state, chartType: action.payload };
    case "TOGGLE_INDICATOR":
      return {
        ...state,
        indicatorSettings: state.indicatorSettings.map((ind) =>
          ind.id === action.payload ? { ...ind, enabled: !ind.enabled } : ind
        ),
      };
    case "UPDATE_INDICATOR_PERIOD":
      return {
        ...state,
        indicatorSettings: state.indicatorSettings.map((ind) =>
          ind.id === action.payload.id ? { ...ind, period: action.payload.period } : ind
        ),
      };
    case "SET_ZOOM_DOMAIN":
      return { ...state, zoomDomain: action.payload };
    case "RESET_VIEW":
      return { ...state, zoomDomain: null };
    case "SET_ACTIVE_SETTINGS":
      return { ...state, activeSettings: action.payload };
    default:
      return state;
  }
}

// --- CUSTOM TOOLTIP COMPONENT ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
        <div className="text-gray-300 text-sm mb-2">{date}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between items-center gap-4">
             <span style={{ color: p.color }} className="font-semibold text-sm capitalize">{p.name}:</span>
             <span style={{ color: p.color }} className="font-bold text-base">
                ₹{p.value}
             </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN CHART COMPONENT ---

export default function HoldingsChart({
  symbol,
  priceHistory,
  buyPrice,
  sellPrice,
}: Props) {
  const [state, dispatch] = useReducer(chartReducer, initialState);
  const { chartType, indicatorSettings, zoomDomain, activeSettings } = state;

  // --- DATA PROCESSING & CALCULATIONS ---

  const chartData = useMemo(() => {
    console.log('priceHistory', priceHistory)
    if (!priceHistory || priceHistory.length === 0) return [];
    const prices = priceHistory.map(p => p.close);

    const sma = indicatorSettings.find(i => i.id === 'sma');
    const ema = indicatorSettings.find(i => i.id === 'ema');
    
    const smaValues = sma?.enabled ? calculateSMA(prices, sma.period) : [];
    const emaValues = ema?.enabled ? calculateEMA(prices, ema.period) : [];

    return priceHistory.map((p, index) => ({
      ...p,
      timestamp: new Date(p.date).getTime(),
      formattedDate: new Date(p.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      sma: smaValues[index],
      ema: emaValues[index],
    }));
  }, [priceHistory, indicatorSettings]);

  const { latestPrice, firstPrice, priceChange, priceChangePercent, isPositive } = useMemo(() => {
    const latestPrice = chartData.length ? chartData[chartData.length - 1].close : 0;
    const firstPrice = chartData.length ? chartData[0].close : 0;
    const priceChange = latestPrice - firstPrice;
    const priceChangePercent = firstPrice ? (priceChange / firstPrice) * 100 : 0;
    return {
        latestPrice,
        firstPrice,
        priceChange,
        priceChangePercent,
        isPositive: priceChange >= 0
    };
  }, [chartData]);

  // --- FORMATTERS & HANDLERS ---

const formatXAxis = (timestamp: number): string => {
  const date = dayjs(timestamp);
  if (!chartData || chartData.length === 0) return date.format("DD MMM HH:mm");

  const start = zoomDomain ? zoomDomain[0] : chartData[0]?.timestamp;
  const end = zoomDomain ? zoomDomain[1] : chartData[chartData.length - 1]?.timestamp;
  const daysDiff = dayjs(end).diff(dayjs(start), "days");

  // If showing less than 2 days of data, show hours:minutes
  if (daysDiff < 2) return date.format("HH:mm");

  // If showing multiple days but less than ~3 months
  if (daysDiff <= 90) return date.format("DD MMM HH:mm");

  // Long ranges fallback to month-year
  return date.format("MMM 'YY");
};


  const handleZoom = useCallback((direction: "in" | "out") => {
    if (!chartData || chartData.length === 0) return;

    const [currentMin, currentMax] = zoomDomain || [
      chartData[0].timestamp,
      chartData[chartData.length - 1].timestamp,
    ];
    
    const range = currentMax - currentMin;
    const center = currentMin + range / 2;
    const zoomFactor = 0.2; // Zoom by 20%
    
    let newRange;
    if (direction === "in") {
      newRange = range * (1 - zoomFactor);
    } else {
      newRange = Math.min(range * (1 + zoomFactor), chartData[chartData.length - 1].timestamp - chartData[0].timestamp);
    }
    
    const newMin = Math.max(chartData[0].timestamp, center - newRange / 2);
    const newMax = Math.min(chartData[chartData.length - 1].timestamp, center + newRange / 2);
    
    dispatch({ type: "SET_ZOOM_DOMAIN", payload: [newMin, newMax] });
  }, [chartData, zoomDomain]);
  
  // --- RENDER ---

  if (!chartData || chartData.length === 0) {
    return (
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-2xl h-[600px] flex items-center justify-center">
            <CardTitle className="text-gray-500">No price history available for {symbol}.</CardTitle>
        </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
      <CardHeader className="border-b border-gray-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-white text-xl font-bold mb-2">
              {symbol} Holdings Performance
            </CardTitle>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className={`flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-semibold">
                  {priceChange > 0 ? '+' : ''}{priceChange} ({priceChangePercent > 0 ? '+' : ''}{priceChangePercent}%)
                </span>
              </div>
              <div className="text-gray-400">
                Current: <span className="text-cyan-400 font-semibold">₹{latestPrice}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={chartType === "line" ? "default" : "ghost"} size="sm" onClick={() => dispatch({ type: "SET_CHART_TYPE", payload: "line" })} className="text-xs">
              <LineChartIcon className="h-4 w-4 mr-1" /> Line
            </Button>
            <Button variant={chartType === "area" ? "default" : "ghost"} size="sm" onClick={() => dispatch({ type: "SET_CHART_TYPE", payload: "area" })} className="text-xs">
              <AreaChart className="h-4 w-4 mr-1" /> Area
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="relative">
          {/* Zoom Controls */}
          <div className="absolute top-2 right-2 z-20 flex gap-1 px-2 py-1 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-md">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => handleZoom("in")}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => handleZoom("out")}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => dispatch({ type: "RESET_VIEW" })}>
              <Home className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                
                <XAxis dataKey="timestamp" type="number" domain={zoomDomain || ["dataMin", "dataMax"]} tickFormatter={formatXAxis} stroke="#ccc" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} interval="preserveStartEnd" allowDataOverflow />
               <YAxis
                                   stroke="#9ca3af"
                                   fontSize={12}
                                   orientation="left"
                                   domain={["auto", "auto"]}
                                   tickFormatter={(v) =>
                                     `$${typeof v === "number" ? v.toFixed(2) : v}`
                                   }
                                   allowDataOverflow
                                   tickLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
                                 />
                <ChartTooltip content={<CustomTooltip />} />

                {buyPrice && <ReferenceLine y={buyPrice} stroke={THEME.positive} strokeDasharray="3 3" label={{ value: `Buy ₹${buyPrice}`, position: "insideTopRight", fill: THEME.positive, fontWeight: "bold", fontSize: 12 }} />}
                {sellPrice && <ReferenceLine y={sellPrice} stroke={THEME.negative} strokeDasharray="3 3" label={{ value: `Sell ₹${sellPrice}`, position: "insideTopRight", fill: THEME.negative, fontWeight: "bold", fontSize: 12 }} />}
                <ReferenceLine y={latestPrice} stroke={THEME.primary} strokeDasharray="2 2" label={{ value: `Current ₹${latestPrice}`, position: "insideTopLeft", fill: THEME.primary, fontWeight: "bold", fontSize: 12 }} />

                {indicatorSettings.map((ind) => ind.enabled && (<Line key={ind.id} type="monotone" dataKey={ind.id} stroke={ind.color} dot={false} strokeWidth={1.5} isAnimationActive={false} name={ind.name} />))}

                {chartType === "area" ? (
                  <Area type="monotone" dataKey="close" name="Price" stroke={THEME.primary} strokeWidth={2.5} fill="url(#areaGradient)" isAnimationActive={true} animationDuration={800} />
                ) : (
                  <Line type="monotone" dataKey="close" name="Price" stroke={THEME.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: THEME.primary }} isAnimationActive={true} animationDuration={800} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Indicators & Stats */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
            {/* Controls */}
            <div className="flex items-center gap-4 flex-wrap bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl">
            {indicatorSettings.map((ind) => (
              <div key={ind.id} className="relative flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/60 transition-all duration-200 border border-gray-700">
                <input type="checkbox" id={ind.id} checked={ind.enabled} onChange={() => dispatch({ type: "TOGGLE_INDICATOR", payload: ind.id })} className="form-checkbox h-4 w-4 text-cyan-500 bg-gray-700 rounded focus:ring-0" />
                <label htmlFor={ind.id} className="text-sm font-medium text-gray-200 cursor-pointer">{ind.name}</label>
                <button onClick={() => dispatch({type: "SET_ACTIVE_SETTINGS", payload: activeSettings === ind.id ? null : ind.id})} className="text-gray-400 hover:text-cyan-400">
                  <Settings className="h-4 w-4" />
                </button>
                {activeSettings === ind.id && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 mt-2 w-44 z-30 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl">
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Period</label>
                    <input type="number" value={ind.period} onChange={(e) => dispatch({ type: "UPDATE_INDICATOR_PERIOD", payload: { id: ind.id, period: parseInt(e.target.value) || 1 } })} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-cyan-500" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-2 rounded-lg bg-gray-800/50">
                    <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Highest</div>
                    <div className="text-white font-semibold">₹{Math.max(...priceHistory.map(p => p.close))}</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-800/50">
                    <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Lowest</div>
                    <div className="text-white font-semibold">₹{Math.min(...priceHistory.map(p => p.close))}</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-800/50">
                    <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Change</div>
                    <div className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{priceChangePercent > 0 ? '+' : ''}{priceChangePercent}%</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-800/50">
                    <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Data Points</div>
                    <div className="text-white font-semibold">{priceHistory.length}</div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}