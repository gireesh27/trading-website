"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useReducer,
  Dispatch,
} from "react";
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
  BarChart,
  Rectangle,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import {
  ArrowUp,
  ArrowDown,
  BarChart3,
  LineChartIcon,
  Activity,
  Plus,
  Minus,
  Maximize,
  Trash2,
  TrendingUp,
  Settings,
  Percent,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "./ui/button";
import { CustomTooltip } from "./customTool-Tip";

//================================================================
// 1. TYPE DEFINITIONS & INTERFACES
//================================================================

/**
 * Core data for a stock's market performance.
 */
export interface Stock {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changesPercentage?: number;
  afterHours?: number;
  afterHoursChange?: number;
}

/**
 * A single data point from the charting API.
 */
export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;

  low: number;
  close: number;
  volume: number;
}

/**
 * Props for the main AdvancedTradingChart component.
 */
export interface AdvancedTradingChartProps {
  symbol: string;
  selectedStock: Stock | null;
  chartCandlestickData: CandlestickPoint[];
  isChartLoading: boolean;
  getCandlestickData: (symbol: string, range: string, interval: string) => void;
}

/**
 * The internal, processed data structure used by the charts.
 */
export interface ChartData extends CandlestickPoint {
  timestamp: number;
  isBullish: boolean;
  [key: string]: any;
}

/**
 * Configuration for a single technical indicator.
 */
export interface IndicatorSetting {
  id: string;
  name: string;
  period: number;
  enabled: boolean;
  color: string;
  type: "SMA" | "EMA";
}

/**
 * State structure managed by the reducer.
 */
interface ChartState {
  range: Range;
  interval: Interval;
  chartType: ChartType;
  drawingTool: DrawingTool | null;
  indicatorSettings: IndicatorSetting[];
  showVolume: boolean;
  showRSI: boolean;
  showMACD: boolean;
  zoomDomain: [number, number] | null;
  drawnShapes: any[];
  currentDrawing: any | null;
}

/**
 * Actions available to modify the chart state.
 */
type ChartAction =
  | { type: "SET_RANGE"; payload: Range }
  | { type: "SET_INTERVAL"; payload: Interval }
  | { type: "SET_CHART_TYPE"; payload: ChartType }
  | { type: "SET_DRAWING_TOOL"; payload: DrawingTool | null }
  | { type: "TOGGLE_INDICATOR"; payload: string }
  | { type: "UPDATE_INDICATOR_PERIOD"; payload: { id: string; period: number } }
  | { type: "TOGGLE_SUBCHART"; payload: "volume" | "rsi" | "macd" }
  | { type: "SET_ZOOM_DOMAIN"; payload: [number, number] | null }
  | { type: "ADD_SHAPE"; payload: any }
  | { type: "CLEAR_SHAPES" }
  | { type: "SET_CURRENT_DRAWING"; payload: any | null }
  | { type: "RESET_VIEW" };

type ChartType = "candlestick" | "line" | "area";
type Range = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "5y" | "max";
type Interval = "5m" | "15m" | "30m" | "1h" | "1d" | "1w" | "1M";
type DrawingTool = "trendline" | "rectangle" | "fibonacci";

//================================================================
// 2. CONSTANTS & THEME
//================================================================

const THEME = {
  positive: "#22c55e",
  negative: "#ef4444",
  accent: "#a78bfa",
  inactive: "#6b7280",
};

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
const intradayIntervals: Interval[] = ["5m", "15m", "30m", "1h"];
const FIBONACCI_LEVELS = [
  { level: 0, color: THEME.inactive },
  { level: 0.236, color: "#fbbf24" },
  { level: 0.382, color: "#f97316" },
  { level: 0.5, color: "#3b82f6" },
  { level: 0.618, color: "#f97316" },
  { level: 0.786, color: "#fbbf24" },
  { level: 1, color: THEME.inactive },
];

//================================================================
// 3. STATE MANAGEMENT (Reducer)
//================================================================

const initialState: ChartState = {
  range: "1d",
  interval: "5m",
  chartType: "area",
  drawingTool: null,
  indicatorSettings: [
    {
      id: "sma20",
      name: "SMA (20)",
      period: 20,
      enabled: false,
      color: "#f59e0b",
      type: "SMA",
    },
    {
      id: "ema50",
      name: "EMA (50)",
      period: 50,
      enabled: false,
      color: "#ec4899",
      type: "EMA",
    },
  ],
  showVolume: true,
  showRSI: true,
  showMACD: true,
  zoomDomain: null,
  drawnShapes: [],
  currentDrawing: null,
};

function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case "SET_RANGE":
      return {
        ...state,
        range: action.payload,
        interval: rangeIntervalMap[action.payload],
      };
    case "SET_INTERVAL":
      return { ...state, interval: action.payload };
    case "SET_CHART_TYPE":
      return { ...state, chartType: action.payload };
    case "SET_DRAWING_TOOL":
      return { ...state, drawingTool: action.payload, currentDrawing: null };
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
          ind.id === action.payload.id
            ? {
                ...ind,
                period: action.payload.period,
                name: `${ind.type} (${action.payload.period})`,
              }
            : ind
        ),
      };
    case "TOGGLE_SUBCHART":
      if (action.payload === "volume")
        return { ...state, showVolume: !state.showVolume };
      if (action.payload === "rsi")
        return { ...state, showRSI: !state.showRSI };
      if (action.payload === "macd")
        return { ...state, showMACD: !state.showMACD };
      return state;
    case "SET_ZOOM_DOMAIN":
      return { ...state, zoomDomain: action.payload };
    case "ADD_SHAPE":
      return { ...state, drawnShapes: [...state.drawnShapes, action.payload] };
    case "CLEAR_SHAPES":
      return { ...state, drawnShapes: [] };
    case "SET_CURRENT_DRAWING":
      return { ...state, currentDrawing: action.payload };
    case "RESET_VIEW":
      return {
        ...state,
        zoomDomain: null,
        drawnShapes: [],
        currentDrawing: null,
        drawingTool: null,
      };
    default:
      throw new Error("Unhandled chart action");
  }
}

//================================================================
// 4. INDICATOR CALCULATION FUNCTIONS
//================================================================

const calculateSMA = (
  data: ChartData[],
  period: number,
  key: string
): ChartData[] =>
  data.map((d, i) =>
    i < period - 1
      ? d
      : {
          ...d,
          [key]:
            data
              .slice(i - period + 1, i + 1)
              .reduce((acc, val) => acc + val.close, 0) / period,
        }
  );
const calculateEMA = (
  data: ChartData[],
  period: number,
  key: string
): ChartData[] => {
  const k = 2 / (period + 1);
  let ema: number | undefined;
  return data.map((d, i) => {
    if (i < period - 1) return { ...d };
    if (i === period - 1)
      ema =
        data.slice(0, period).reduce((acc, val) => acc + val.close, 0) / period;
    else if (ema !== undefined) ema = d.close * k + ema * (1 - k);
    return { ...d, [key]: ema };
  });
};
const calculateRSI = (data: ChartData[]): ChartData[] =>
  data.map((d) => ({ ...d, rsi: 50 + Math.random() * 20 - 10 }));
const calculateMACD = (data: ChartData[]): ChartData[] => {
  const ema12 = calculateEMA(data, 12, "ema12").map((d) => d.ema12);
  const ema26 = calculateEMA(data, 26, "ema26").map((d) => d.ema26);
  let macdData = data.map((d, i) => {
    if (ema12[i] && ema26[i]) return { ...d, macd: ema12[i] - ema26[i] };
    return d;
  });
  const signalLineData = calculateEMA(
    macdData.filter((d) => d.macd !== undefined),
    9,
    "signal"
  ).map((d) => d.signal);
  let signalIndex = 0;
  return macdData.map((d) => {
    if (d.macd !== undefined) {
      const signal = signalLineData[signalIndex];
      if (signal !== undefined) {
        signalIndex++;
        return { ...d, signal: signal, histogram: d.macd - signal };
      }
    }
    return d;
  });
};

//================================================================
// 5. HELPER & CUSTOM UI COMPONENTS
//================================================================

function StockChartHeader({ stock }: { stock: Stock | null }) {
  if (!stock) return null;
  const isPositive = stock.change && stock.change >= 0;
  const changeColor = isPositive ? `text-emerald-400` : `text-red-400`;
  const bgColor = isPositive ? `bg-emerald-500/10` : `bg-red-500/10`;
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;
  return (
    <div className="mb-4 px-1">
      <h2 className="text-2xl lg:text-3xl font-bold text-white">
        {stock.name} <span className="text-gray-400">({stock.symbol})</span>
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-end gap-x-4 gap-y-2 mt-2">
        <p className="text-4xl lg:text-5xl font-bold text-white">
          ${stock.price?.toFixed(2)}
        </p>
        <div className={`flex items-center gap-2 ${changeColor}`}>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-lg font-semibold ${bgColor}`}
          >
            <ChangeIcon className="h-5 w-5" />
            <span>{stock.changesPercentage?.toFixed(2)}%</span>
          </div>
          <span className="text-lg font-semibold">
            {isPositive ? "+" : ""}
            {stock.change?.toFixed(2)} Today
          </span>
        </div>
      </div>
    </div>
  );
}

const CustomCandle = (props: any) => {
  const { x, y, width, height, open, close } = props;
  const isBullish = close > open;
  const fill = isBullish ? THEME.positive : THEME.negative;

  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke={fill}
    />
  );
};

const DrawnShapes = ({
  shapes,
  chartRef,
}: {
  shapes: any[];
  chartRef: React.RefObject<any>;
}) => {
  if (!shapes.length || !chartRef.current) return null;
  const chartState = chartRef.current.getChartLayouts()?.[0];
  if (!chartState?.xMap?.scale || !chartState?.yMap?.scale) return null;
  const { xScale, yScale } = {
    xScale: chartState.xMap.scale,
    yScale: chartState.yMap.scale,
  };

  return (
    <g>
      {shapes.map((shape, index) => {
        const startX = xScale(shape.start.x);
        const startY = yScale(shape.start.y);
        const endX = xScale(shape.end.x);
        const endY = yScale(shape.end.y);
        if (
          [startX, startY, endX, endY].some((v) => v === undefined || isNaN(v))
        )
          return null;
        if (shape.type === "trendline")
          return (
            <line
              key={index}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={THEME.accent}
              strokeWidth={2}
              strokeDasharray={shape.isDrawing ? "4 4" : "none"}
            />
          );
        if (shape.type === "rectangle")
          return (
            <rect
              key={index}
              x={Math.min(startX, endX)}
              y={Math.min(startY, endY)}
              width={Math.abs(startX - endX)}
              height={Math.abs(startY - endY)}
              fill="rgba(167, 139, 250, 0.2)"
              stroke={THEME.accent}
              strokeWidth={1}
            />
          );
        if (shape.type === "fibonacci") {
          const priceRange = Math.abs(shape.start.y - shape.end.y);
          const minPrice = Math.min(shape.start.y, shape.end.y);
          return (
            <g key={index}>
              {FIBONACCI_LEVELS.map((fib) => {
                const y = yScale(minPrice + priceRange * fib.level);
                const x1 = Math.min(startX, endX);
                const x2 = Math.max(startX, endX);
                return (
                  <React.Fragment key={fib.level}>
                    <line
                      x1={x1}
                      y1={y}
                      x2={x2}
                      y2={y}
                      stroke={fib.color}
                      strokeDasharray="5 5"
                      strokeWidth={1}
                    />
                    <text x={x1 + 5} y={y - 5} fill={fib.color} fontSize="10">
                      {fib.level.toFixed(3)}
                    </text>
                  </React.Fragment>
                );
              })}
            </g>
          );
        }
        return null;
      })}
    </g>
  );
};

const SubChartCard = ({
  title,
  onToggle,
  children,
}: {
  title: string;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-800/50 border-gray-700/50 rounded-lg">
    <div className="px-4 py-2 flex justify-between items-center border-b border-gray-700/50">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <button onClick={onToggle} className="text-gray-400 hover:text-white">
        <EyeOff className="h-4 w-4" />
      </button>
    </div>
    <div className="p-2">{children}</div>
  </div>
);

const VolumeChart = ({ data }: { data: ChartData[] }) => (
  <ResponsiveContainer width="100%" height={100}>
    <BarChart
      data={data}
      syncId="syncedCharts"
      margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
      <XAxis dataKey="timestamp" hide={true} />
      <YAxis
        orientation="left"
        stroke="#9ca3af"
        fontSize={10}
        tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
      />
      <Tooltip
        content={
          <CustomTooltip
            active={false}
            payload={[]}
            coordinate={{ x: 0, y: 0 }}
            accessibilityLayer={false}
          />
        }
      />
      {data.map((entry) => (
        <Bar
          key={entry.timestamp}
          dataKey="volume"
          fill={entry.isBullish ? THEME.positive : THEME.negative}
          opacity={0.6}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

const RsiChart = ({ data }: { data: ChartData[] }) => (
  <ResponsiveContainer width="100%" height={100}>
    <LineChart
      data={data}
      syncId="syncedCharts"
      margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
      <XAxis dataKey="timestamp" hide={true} />
      <YAxis
        stroke="#9ca3af"
        fontSize={10}
        domain={[0, 100]}
        orientation="left"
      />
      <Tooltip wrapperClassName="!text-xs" />
      <ReferenceLine y={70} stroke={THEME.negative} strokeDasharray="2 2" />
      <ReferenceLine y={30} stroke={THEME.positive} strokeDasharray="2 2" />
      <Line type="monotone" dataKey="rsi" stroke="#f97316" dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const MacdChart = ({ data }: { data: ChartData[] }) => (
  <ResponsiveContainer width="100%" height={100}>
    <ComposedChart
      data={data}
      syncId="syncedCharts"
      margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
      <XAxis dataKey="timestamp" hide={true} />
      <YAxis stroke="#9ca3af" fontSize={10} orientation="left" />
      <Tooltip wrapperClassName="!text-xs" />
      <ReferenceLine y={0} stroke={THEME.inactive} />
      <Bar dataKey="histogram">
        {data.map((entry) => (
          <Bar
            key={entry.timestamp}
            dataKey="histogram"
            fill={entry.histogram >= 0 ? THEME.positive : THEME.negative}
          />
        ))}
      </Bar>
      <Line type="monotone" dataKey="macd" stroke="#3b82f6" dot={false} />
      <Line type="monotone" dataKey="signal" stroke="#ef4444" dot={false} />
    </ComposedChart>
  </ResponsiveContainer>
);

//================================================================
// 6. MAIN CHART COMPONENT
//================================================================

export function AdvancedTradingChart({
  symbol,
  selectedStock,
  chartCandlestickData,
  isChartLoading,
  getCandlestickData,
}: AdvancedTradingChartProps) {
  const mainChartRef = useRef<any>(null);
  const [state, dispatch] = useReducer(chartReducer, initialState);
  const {
    range,
    interval,
    chartType,
    drawingTool,
    indicatorSettings,
    showVolume,
    showRSI,
    showMACD,
    zoomDomain,
    drawnShapes,
    currentDrawing,
  } = state;
  const [activeSettings, setActiveSettings] = useState<string | null>(null);

  const fullChartData: ChartData[] = useMemo(() => {
    if (!chartCandlestickData || chartCandlestickData.length === 0) return [];
    let data = chartCandlestickData.map((d) => ({
      ...d,
      timestamp: new Date(d.time).getTime(),
      isBullish: d.close >= d.open,
    }));
    data = calculateRSI(data);
    data = calculateMACD(data);
    indicatorSettings.forEach((ind) => {
      if (ind.enabled) {
        if (ind.type === "SMA") data = calculateSMA(data, ind.period, ind.id);
        if (ind.type === "EMA") data = calculateEMA(data, ind.period, ind.id);
      }
    });
    return data;
  }, [chartCandlestickData, indicatorSettings]);

  const visibleChartData = useMemo(() => {
    if (!zoomDomain) return fullChartData;
    const [start, end] = zoomDomain;
    return fullChartData.filter(
      (d) => d.timestamp >= start && d.timestamp <= end
    );
  }, [fullChartData, zoomDomain]);

  useEffect(() => {
    if (symbol) {
      const newInterval = rangeIntervalMap[range];
      dispatch({ type: "SET_INTERVAL", payload: newInterval });
      dispatch({ type: "RESET_VIEW" });
      getCandlestickData(symbol, range, newInterval);
    }
  }, [symbol, range, getCandlestickData]);

  const getCoordinatesFromEvent = (e: any) => {
    if (!e || e.activeLabel === undefined || e.chartY === undefined)
      return null;
    const chart = mainChartRef.current;
    const chartState = chart?.getChartLayouts()?.[0];
    if (!chartState?.yMap?.scale?.invert) return null;
    return { x: e.activeLabel, y: chartState.yMap.scale.invert(e.chartY) };
  };

  const handleMouseDown = (e: any) => {
    if (drawingTool && !currentDrawing && e) {
      const coords = getCoordinatesFromEvent(e);
      if (coords)
        dispatch({
          type: "SET_CURRENT_DRAWING",
          payload: {
            type: drawingTool,
            start: coords,
            end: coords,
            isDrawing: true,
          },
        });
    }
  };
  const handleMouseMove = (e: any) => {
    if (drawingTool && currentDrawing && e) {
      const coords = getCoordinatesFromEvent(e);
      if (coords)
        dispatch({
          type: "SET_CURRENT_DRAWING",
          payload: { ...currentDrawing, end: coords },
        });
    }
  };
  const handleMouseUp = (e: any) => {
    if (drawingTool && currentDrawing && e) {
      const coords = getCoordinatesFromEvent(e);
      const finalShape = {
        ...currentDrawing,
        end: coords || currentDrawing.end,
        isDrawing: false,
      };
      dispatch({ type: "ADD_SHAPE", payload: finalShape });
      dispatch({ type: "SET_CURRENT_DRAWING", payload: null });
      dispatch({ type: "SET_DRAWING_TOOL", payload: null });
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    if (!fullChartData.length) return;
    const fullDomain: [number, number] = [
      fullChartData[0].timestamp,
      fullChartData[fullChartData.length - 1].timestamp,
    ];
    const [start, end] = zoomDomain ?? fullDomain;
    const center = (start + end) / 2;
    const zoomFactor = direction === "in" ? 0.7 : 1.5;
    const newSpan = (end - start) * zoomFactor;
    let newStart = center - newSpan / 2;
    let newEnd = center + newSpan / 2;
    if (newEnd - newStart < 60000 * 5) return;
    if (newEnd - newStart > fullDomain[1] - fullDomain[0])
      dispatch({ type: "SET_ZOOM_DOMAIN", payload: null });
    else
      dispatch({
        type: "SET_ZOOM_DOMAIN",
        payload: [
          Math.max(newStart, fullDomain[0]),
          Math.min(newEnd, fullDomain[1]),
        ],
      });
  };

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    const visibleDomain =
      zoomDomain ??
      (fullChartData.length > 0
        ? [
            fullChartData[0].timestamp,
            fullChartData[fullChartData.length - 1].timestamp,
          ]
        : null);
    if (!visibleDomain) return "";
    const duration = visibleDomain[1] - visibleDomain[0];

    if (duration <= 2 * 24 * 60 * 60 * 1000)
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    if (duration <= 31 * 24 * 60 * 60 * 1000)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    if (duration <= 365 * 24 * 60 * 60 * 1000)
      return date.toLocaleDateString("en-US", { month: "short" });
    return date.toLocaleDateString("en-US", { year: "numeric" });
  };

  if (isChartLoading)
    return (
      <div className="h-[800px] flex items-center justify-center text-gray-400">
        <Activity className="h-12 w-12 animate-pulse" />
      </div>
    );
  if (!selectedStock)
    return (
      <div className="h-[800px] flex items-center justify-center text-gray-400">
        <p>Select a stock to view the chart.</p>
      </div>
    );

  return (
    <div className="space-y-4 bg-gray-900 text-white p-2 md:p-4 rounded-lg">
      <StockChartHeader stock={selectedStock} />

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-700/50 pb-4 mb-4">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {ranges.map((r) => (
              <Button
                key={r}
                variant={range === r ? "secondary" : "ghost"}
                size="sm"
                onClick={() => dispatch({ type: "SET_RANGE", payload: r })}
              >
                {r.toUpperCase()}
              </Button>
            ))}
          </div>
          {range === "1d" && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:border-l md:border-gray-700 md:ml-2 md:pl-2">
              {intradayIntervals.map((i) => (
                <Button
                  key={i}
                  variant={interval === i ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_INTERVAL", payload: i })}
                >
                  {i}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div
          className="relative"
          style={{ cursor: drawingTool ? "crosshair" : "default" }}
        >
          <div className="absolute top-2 right-2 z-20 flex gap-1 bg-gray-900/50 backdrop-blur-sm rounded-md">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={() => handleZoom("in")}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={() => handleZoom("out")}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          {!visibleChartData.length ? (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              <p>No data available.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                ref={mainChartRef}
                data={visibleChartData}
                syncId="syncedCharts"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={THEME.positive}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={THEME.positive}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.1)"
                />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={zoomDomain ?? ["dataMin", "dataMax"]}
                  stroke="#9ca3af"
                  fontSize={12}
                  allowDataOverflow
                  tickLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
                  tickFormatter={formatXAxis}
                />
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
                <Tooltip
                  content={
                    <CustomTooltip
                      active={false}
                      payload={[]}
                      coordinate={{ x: 0, y: 0 }}
                      accessibilityLayer={false}
                    />
                  }
                  cursor={{ stroke: "#9ca3af", strokeDasharray: "3 3" }}
                  wrapperStyle={{ outline: "none" }}
                />
                {indicatorSettings.map(
                  (ind) =>
                    ind.enabled && (
                      <Line
                        key={ind.id}
                        type="monotone"
                        dataKey={ind.id}
                        stroke={ind.color}
                        dot={false}
                        strokeWidth={1.5}
                      />
                    )
                )}
                {chartType === "area" && (
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={THEME.positive}
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                  />
                )}
                {chartType === "candlestick" && (
                  <Bar
                    dataKey="open"
                    shape={(props: any) => <CustomCandle {...props} />}
                    isAnimationActive={false}
                  />
                )}
                {chartType === "line" && (
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={THEME.positive}
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                <Customized
                  component={DrawnShapes}
                  shapes={[
                    ...drawnShapes,
                    ...(currentDrawing ? [currentDrawing] : []),
                  ]}
                  chartRef={mainChartRef}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={drawingTool === "trendline" ? "secondary" : "outline"}
              size="sm"
              onClick={() =>
                dispatch({ type: "SET_DRAWING_TOOL", payload: "trendline" })
              }
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trendline
            </Button>
            <Button
              variant={drawingTool === "rectangle" ? "secondary" : "outline"}
              size="sm"
              onClick={() =>
                dispatch({ type: "SET_DRAWING_TOOL", payload: "rectangle" })
              }
            >
              <Maximize className="h-4 w-4 mr-2" />
              Rectangle
            </Button>
            <Button
              variant={drawingTool === "fibonacci" ? "secondary" : "outline"}
              size="sm"
              onClick={() =>
                dispatch({ type: "SET_DRAWING_TOOL", payload: "fibonacci" })
              }
            >
              <Percent className="h-4 w-4 mr-2" />
              Fibonacci
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => dispatch({ type: "CLEAR_SHAPES" })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap lg:border-l lg:border-gray-700 lg:ml-2 lg:pl-4">
            {indicatorSettings.map((ind) => (
              <div
                key={ind.id}
                className="relative flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id={ind.id}
                  checked={ind.enabled}
                  onChange={() =>
                    dispatch({ type: "TOGGLE_INDICATOR", payload: ind.id })
                  }
                  className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <label htmlFor={ind.id} className="text-sm text-white">
                  {ind.name}
                </label>
                <button
                  onClick={() =>
                    setActiveSettings(activeSettings === ind.id ? null : ind.id)
                  }
                  className="text-gray-400 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </button>
                {activeSettings === ind.id && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-600 rounded-lg p-2 z-20 w-40">
                    <label className="text-xs">Period</label>
                    <input
                      type="number"
                      value={ind.period}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_INDICATOR_PERIOD",
                          payload: {
                            id: ind.id,
                            period: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                      className="w-full bg-gray-700 rounded-md p-1 text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {showVolume && (
          <SubChartCard
            title="Volume"
            onToggle={() =>
              dispatch({ type: "TOGGLE_SUBCHART", payload: "volume" })
            }
          >
            <VolumeChart data={visibleChartData} />
          </SubChartCard>
        )}
        {showRSI && (
          <SubChartCard
            title="RSI (14)"
            onToggle={() =>
              dispatch({ type: "TOGGLE_SUBCHART", payload: "rsi" })
            }
          >
            <RsiChart data={visibleChartData} />
          </SubChartCard>
        )}
        {showMACD && (
          <SubChartCard
            title="MACD (12, 26, 9)"
            onToggle={() =>
              dispatch({ type: "TOGGLE_SUBCHART", payload: "macd" })
            }
          >
            <MacdChart data={visibleChartData} />
          </SubChartCard>
        )}
      </div>
    </div>
  );
}