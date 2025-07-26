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
  ComposedChart,
  Bar,
  Area,
  ReferenceLine,
  Customized,
  TooltipProps,
  BarChart,
  Rectangle,
  CartesianGrid,
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
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isToday from "dayjs/plugin/isToday";
import dynamic from "next/dynamic";
const DrawingCanvas = dynamic(() => import("./DrawingCanva"), {
  ssr: false,
});

dayjs.extend(advancedFormat);
dayjs.extend(isToday);

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
  timestamp: string | number | Date;
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
  getCandlestickData: (
    symbol: string,
    range: Range,
    interval: Interval
  ) => void;
  range: Range; // ✅ New prop
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
  candles: any;
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
  | { type: "SET_CANDLES"; payload: CandlestickPoint[] } // ✅ Add this
  | { type: "ADD_SHAPE"; payload: any }
  | { type: "CLEAR_SHAPES" }
  | { type: "SET_CURRENT_DRAWING"; payload: any | null }
  | { type: "RESET_VIEW" };

type ChartType = "candlestick" | "line" | "area";
export type Range = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "max";
type Interval = "5m" | "15m" | "30m" | "1h" | "1d" | "1w" | "1m";
type DrawingTool =
  | "trendline"
  | "rectangle"
  | "fibonacci"
  | "arrow"
  | "text"
  | "line";

type ShapeType = "line" | "rectangle" | "arrow" | "text";

interface Point {
  x: number;
  y: number;
}

interface Shape {
  type: ShapeType;
  start: Point;
  end: Point;
}

//================================================================
// 2. CONSTANTS & THEME
//================================================================

const THEME = {
  positive: "#22c55e",
  negative: "#ef4444",
  accent: "#a78bfa",
  inactive: "#6b7280",
};
const rangeIntervalMap: Record<Range, Interval> = {
  "1d": "5m",
  "5d": "15m",
  "1mo": "1d",
  "3mo": "1d",
  "6mo": "1d",
  "1y": "1w",
  max: "1m",
};

const ranges: Range[] = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "max"];
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
  candles: undefined,
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
    case "SET_CANDLES": {
      const timestamps = action.payload.map((d) => new Date(d.time).getTime());
      const domain: [number, number] = [
        Math.min(...timestamps),
        Math.max(...timestamps),
      ];

      return {
        ...state,
        candles: action.payload,
        zoomDomain: domain,
      };
    }

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
  // This component renders the drawn shapes on the chart.
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
          const x1 = xScale(shape.start.x);
          const x2 = xScale(shape.end.x);

          const yStart = shape.start.y;
          const yEnd = shape.end.y;

          const priceRange = yStart - yEnd;
          const direction = priceRange >= 0 ? 1 : -1;

          return (
            <g key={index}>
              {FIBONACCI_LEVELS.map((fib) => {
                const level =
                  yEnd + direction * Math.abs(priceRange) * fib.level;
                const y = yScale(level);
                if (isNaN(x1) || isNaN(x2) || isNaN(y)) return null;

                return (
                  <React.Fragment key={fib.level}>
                    <line
                      x1={x1}
                      y1={y}
                      x2={x2}
                      y2={y}
                      stroke={fib.color}
                      strokeDasharray="4 2"
                      strokeWidth={1}
                    />
                    <text
                      x={x1 + 4}
                      y={y - 4}
                      fill={fib.color}
                      fontSize={10}
                      fontWeight={500}
                    >
                      {(fib.level * 100).toFixed(1)}%
                    </text>
                  </React.Fragment>
                );
              })}
            </g>
          );
        }
        if (shape.type === "arrow") {
          const x1 = xScale(shape.start.x);
          const y1 = yScale(shape.start.y);
          const x2 = xScale(shape.end.x);
          const y2 = yScale(shape.end.y);

          if ([x1, y1, x2, y2].some((v) => isNaN(v))) return null;

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="yellow"
              strokeWidth={2}
            />
          );
        }

        // If the shape type is 'arrow', render a line with a specific color and width.
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
    candles,
  } = state;
  const [activeSettings, setActiveSettings] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<Range>("1d");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(800); // fallback value
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([]);
  const [redoStack, setRedoStack] = useState<Shape[][]>([]);

  const undo = () => {
    if (history.length === 0) return;
    const prevShapes = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setRedoStack([shapes, ...redoStack]);
    setShapes(prevShapes);
    setHistory(newHistory);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextShapes = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    setHistory([...history, shapes]);
    setShapes(nextShapes);
    setRedoStack(newRedoStack);
  };

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

  const filterMarketHours = (data: CandlestickPoint[]) => {
    if (range !== "1d") return data;

    return data.filter((d) => {
      const date = new Date(d.timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return (
        (hours > 9 || (hours === 9 && minutes >= 15)) &&
        (hours < 15 || (hours === 15 && minutes <= 30))
      );
    });
  };
  const filteredData = filterMarketHours(chartCandlestickData);
  const handleRangeChange = (newRange: Range) => {
    dispatch({ type: "SET_RANGE", payload: newRange });
  };

  const handleIntervalChange = (newInterval: Interval) => {
    dispatch({ type: "SET_INTERVAL", payload: newInterval });
  };
  useEffect(() => {
    if (chartCandlestickData.length > 0) {
      dispatch({ type: "SET_CANDLES", payload: chartCandlestickData });
    }
  }, [chartCandlestickData]);

  // Fetch on range/interval change
  useEffect(() => {
    if (!symbol) return;
    const selectedInterval =
      range === "1d" ? interval : rangeIntervalMap[range];
    dispatch({ type: "RESET_VIEW" });
    getCandlestickData(symbol, range, selectedInterval);
  }, [symbol, range, interval, getCandlestickData]);
  useEffect(() => {
    if (chartContainerRef.current) {
      setChartWidth(chartContainerRef.current.offsetWidth);
    }
  }, []);
  const getCoordinatesFromEvent = (e: any) => {
    if (!e || e.activeLabel === undefined || e.chartY === undefined)
      return null;
    const chart = mainChartRef.current;
    const chartState = chart?.getChartLayouts()?.[0];
    if (!chartState?.yMap?.scale?.invert) return null;
    return { x: e.activeLabel, y: chartState.yMap.scale.invert(e.chartY) };
  };

  const handleMouseDown = (e: any) => {
    if (!drawingTool) return;

    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    if (!drawingRef.current) {
      // ✅ First click: set start
      const initial = {
        type: drawingTool,
        start: coords,
        end: coords,
        isDrawing: true,
      };
      drawingRef.current = initial;
      dispatch({ type: "SET_CURRENT_DRAWING", payload: initial });
    } else {
      // ✅ Second click: finalize drawing
      const final = {
        ...drawingRef.current,
        end: coords,
        isDrawing: false,
      };
      dispatch({ type: "ADD_SHAPE", payload: final });
      dispatch({ type: "SET_CURRENT_DRAWING", payload: null });
      drawingRef.current = null;
      dispatch({ type: "SET_DRAWING_TOOL", payload: null }); // Exit drawing mode
    }
  };

  const drawingRef = useRef<any>(null);

  const handleMouseMove = (e: any) => {
    if (!drawingTool || !drawingRef.current) return;

    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    drawingRef.current = { ...drawingRef.current, end: coords };
    requestAnimationFrame(() => {
      dispatch({ type: "SET_CURRENT_DRAWING", payload: drawingRef.current });
    });
  };

  const handleMouseUp = (e: any) => {
    if (drawingTool && drawingRef.current && e) {
      const coords = getCoordinatesFromEvent(e);
      const finalShape = {
        ...drawingRef.current,
        end: coords || drawingRef.current.end,
        isDrawing: false,
      };
      dispatch({ type: "ADD_SHAPE", payload: finalShape });
      drawingRef.current = null;
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

  const formatXAxis = (
    timestamp: number,
    zoomDomain: [number, number] | null,
    range: Range
  ): string => {
    const date = dayjs(timestamp);
    if (!zoomDomain || zoomDomain.length !== 2) return "";
    const startYear = dayjs(zoomDomain[0]).year();

    switch (range) {
      case "1d":
        return date.format("h:mm A"); // 9:30 AM
      case "5d":
      case "1mo":
        return date.format("MMM D"); // Jul 26
      case "3mo":
      case "6mo":
      case "1y":
        return date.year() !== startYear
          ? date.format("MMM D, YY")
          : date.format("MMM D");
      case "max":
        return date.format("MMM YY");
      default:
        return date.format("MMM D");
    }
  };
  const customTicks = useMemo(() => {
    if (!candles || candles.length === 0) return [];

    const timestamps = candles.map((d: { time: string | number | Date }) =>
      new Date(d.time).getTime()
    );
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);

    const ticks: number[] = [];

    if (range === "1d") {
      // ⏱ For 1D: show every 30 minutes
      const step = 30 * 60 * 1000;
      for (let t = min; t <= max; t += step) {
        ticks.push(t);
      }
    } else {
      // 📆 For 5D and above: remove duplicate date labels
      const step = Math.floor((max - min) / 12); // 10–12 ticks
      const labelSet = new Set<string>();

      for (let t = min; t <= max; t += step) {
        const label = formatXAxis(t, [min, max], range);
        if (!labelSet.has(label)) {
          labelSet.add(label);
          ticks.push(t);
        }
      }
    }

    return ticks;
  }, [candles, range]);

  const VolumeChart = ({ data }: { data: ChartData[] }) => (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart
        data={data}
        syncId="syncedCharts"
        margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.1)"
        />
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
              drawingTool={null}
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
        data={filteredData}
        syncId="syncedCharts"
        margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.1)"
        />
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

  // const MacdChart = ({ data }: { data: ChartData[] }) => (
  //   <ResponsiveContainer width="100%" height={400}>
  //     <LineChart data={filteredData}>
  //       <XAxis
  //         dataKey="timestamp"
  //         domain={zoomDomain || ["dataMin", "dataMax"]}
  //         type="number"
  //         tickFormatter={(tick) => formatXAxis(tick, zoomDomain,range)}
  //       />
  //       <YAxis dataKey="close" domain={["auto", "auto"]} />
  //       <Tooltip
  //         labelFormatter={(label) => dayjs(label).format("MMM D, YYYY h:mm A")}
  //       />
  //       <Line
  //         type="monotone"
  //         dataKey="close"
  //         stroke="#22c55e"
  //         dot={false}
  //         strokeWidth={2}
  //       />
  //     </LineChart>
  //   </ResponsiveContainer>
  // );

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

        <div className="relative" ref={chartContainerRef}>
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
            <>
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
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                    domain={zoomDomain ?? ["auto", "auto"]}
                    ticks={customTicks}
                    tickFormatter={(tick) =>
                      formatXAxis(tick, zoomDomain, range)
                    }
                    tick={{ fill: "#aaa", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
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
                        drawingTool={drawingTool}
                        active={false}
                        payload={[]}
                        coordinate={{ x: 0, y: 0 }}
                        accessibilityLayer={false}
                      />
                    }
                    cursor={
                      drawingTool
                        ? false
                        : { stroke: "#9ca3af", strokeDasharray: "3 3" }
                    }
                    wrapperStyle={{
                      outline: "none",
                      display: drawingTool ? "none" : "block",
                    }}
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
                  <DrawnShapes
                    shapes={[
                      ...drawnShapes,
                      ...(currentDrawing ? [currentDrawing] : []),
                    ]}
                    chartRef={mainChartRef}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <DrawingCanvas
                width={chartWidth}
                height={400}
                drawingTool={
                  drawingTool === "trendline"
                    ? "line"
                    : drawingTool === "fibonacci"
                    ? "line"
                    : drawingTool
                }
                shapes={shapes}
                setShapes={setShapes}
                history={history}
                setHistory={setHistory} // ✅ REQUIRED
                redoStack={redoStack}
                setRedoStack={setRedoStack}
              />
            </>
          )}
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
            {/* Drawing tool buttons */}
            <Button
              variant={drawingTool === "line" ? "secondary" : "outline"}
              onClick={() =>
                dispatch({ type: "SET_DRAWING_TOOL", payload: "line" })
              }
            >
              Line
            </Button>
            <Button
              variant={drawingTool === "rectangle" ? "secondary" : "outline"}
              onClick={() =>
                dispatch({ type: "SET_DRAWING_TOOL", payload: "rectangle" })
              }
            >
              Rectangle
            </Button>
            <Button
              variant={drawingTool === "arrow" ? "secondary" : "outline"}
              onClick={() =>
                dispatch({ type: "SET_DRAWING_TOOL", payload: "arrow" })
              }
            >
              Arrow
            </Button>
            <Button
              variant={drawingTool === "text" ? "secondary" : "outline"}
              onClick={() =>
                dispatch({ type: "SET_DRAWING_TOOL", payload: "text" })
              }
            >
              Text
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

      {/*  <div className="space-y-2">
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
      </div>*/}
    </div>
  );
}
