"use client";

import React, { useMemo, useReducer, useRef } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart as LineChartIcon,
  AreaChart,
  TrendingUp,
  TrendingDown,
  Settings,
} from "lucide-react";
import dayjs from "dayjs";
import { motion, useMotionValue, useTransform } from "framer-motion";

// --- TYPES AND INTERFACES (Unchanged) ---

interface PricePoint {
  symbol: string;
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

interface ChartData extends PricePoint {
  timestamp: number;
  formattedDate: string;
  sma?: number;
  ema?: number;
}

interface Indicator {
  id: "sma" | "ema";
  name: string;
  enabled: boolean;
  period: number;
  color: string;
}

interface ChartState {
  chartType: "line" | "area";
  indicatorSettings: Indicator[];
  activeSettings: string | null;
}

type ChartAction =
  | { type: "SET_CHART_TYPE"; payload: "line" | "area" }
  | { type: "TOGGLE_INDICATOR"; payload: string }
  | { type: "UPDATE_INDICATOR_PERIOD"; payload: { id: string; period: number } }
  | { type: "SET_ACTIVE_SETTINGS"; payload: string | null };

interface Props {
  symbol: string;
  priceHistory: PricePoint[];
  buyPrice?: number;
  sellPrice?: number;
}

// --- THEME & CONSTANTS (Updated) ---

const THEME = {
  positive: "#10b981", // Emerald 500
  negative: "#f43f5e", // Rose 500
  primary: "#00f0ff", // Bright Cyan
  inactive: "#6b7280", // Gray 500
  sma: "#f59e0b", // Amber 500
  ema: "#ec4899", // Pink 500
};

// --- STYLISH CUSTOM TOOLTIP ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = dayjs(label).format("DD MMM 'YY, hh:mm A");

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="rounded-xl border border-white/10 bg-black/50 p-4 shadow-2xl backdrop-blur-lg"
      >
        <p className="text-sm font-semibold text-white">{`₹${data.close.toFixed(
          2
        )}`}</p>
        <p className="mb-2 text-xs text-gray-400">{date}</p>
        <div className="space-y-1 border-t border-white/10 pt-2">
          {payload.map((p: any) => (
            <div
              key={p.dataKey}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.stroke || p.fill }}
                />
                <span className="text-gray-300">{p.name}:</span>
              </div>
              <span className="font-mono font-semibold text-white">
                {p.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }
  return null;
};

// --- TECHNICAL INDICATOR CALCULATORS (Unchanged) ---

const calculateSMA = (
  data: number[],
  period: number
): (number | undefined)[] => {
  const sma: (number | undefined)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(undefined);
    } else {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};

const calculateEMA = (
  data: number[],
  period: number
): (number | undefined)[] => {
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

// --- STATE MANAGEMENT (REDUCER) (Unchanged) ---

const initialState: ChartState = {
  chartType: "area",
  indicatorSettings: [
    { id: "sma", name: "SMA", enabled: false, period: 20, color: THEME.sma },
    { id: "ema", name: "EMA", enabled: false, period: 20, color: THEME.ema },
  ],
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
          ind.id === action.payload.id
            ? { ...ind, period: action.payload.period }
            : ind
        ),
      };
    case "SET_ACTIVE_SETTINGS":
      return { ...state, activeSettings: action.payload };
    default:
      return state;
  }
}

// --- MAIN CHART COMPONENT (Refactored for Style) ---

export default function HoldingsChart({
  symbol,
  priceHistory,
  buyPrice,
  sellPrice,
}: Props) {
  const [state, dispatch] = useReducer(chartReducer, initialState);
  const { chartType, indicatorSettings, activeSettings } = state;
  const cardRef = useRef<HTMLDivElement>(null);

  // --- Aurora Effect Hooks ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const backgroundGradient = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(400px at ${x}px ${y}px, rgba(0, 240, 255, 0.15), transparent 80%)`
  );

  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];

    const prices = priceHistory.map((p) => p.close);

    const sma = indicatorSettings.find((i) => i.id === "sma");
    const ema = indicatorSettings.find((i) => i.id === "ema");

    const smaValues = sma?.enabled ? calculateSMA(prices, sma.period) : [];
    const emaValues = ema?.enabled ? calculateEMA(prices, ema.period) : [];

    return priceHistory
      .map((p, index) => {
        const shiftedDate = new Date(p.date);
        shiftedDate.setHours(shiftedDate.getHours() + 15); // shift UTC → IST

        const hours = shiftedDate.getHours();
        const minutes = shiftedDate.getMinutes();

        // ✅ Only keep 9:30 AM – 5:30 PM
        if (
          hours < 9 ||
          (hours === 9 && minutes < 30) ||
          hours > 17 ||
          (hours === 17 && minutes > 30)
        ) {
          return null;
        }

        return {
          ...p,
          timestamp: shiftedDate.getTime(),
          formattedDate: `${shiftedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
            timeZone: "Asia/Kolkata",
          })} ${shiftedDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          })}`,
          sma: smaValues[index],
          ema: emaValues[index],
        };
      })
      .filter(Boolean);
  }, [priceHistory, indicatorSettings]);

  const formatXAxis = (timestamp: number): string => {
    const date = dayjs(timestamp);
    if (!chartData || chartData.length === 0)
      return date.format("DD MMM HH:mm");

    const start = chartData[0]?.timestamp;
    const end = chartData[chartData.length - 1]?.timestamp;
    const daysDiff = dayjs(end).diff(dayjs(start), "days");

    // If showing less than 2 days of data, show hours:minutes
    if (daysDiff < 2) return date.format("HH:mm");

    // If showing multiple days but less than ~3 months
    if (daysDiff <= 90) return date.format("DD MMM HH:mm");

    // Long ranges fallback to month-year
    return date.format("MMM 'YY");
  };
  const {
    latestPrice,
    firstPrice,
    priceChange,
    priceChangePercent,
    isPositive,
  } = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) {
      return {
        latestPrice: 0,
        firstPrice: 0,
        priceChange: 0,
        priceChangePercent: 0,
        isPositive: true,
      };
    }

    // Ensure priceHistory is sorted by date
    const sortedHistory = [...priceHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstPrice = sortedHistory[0]?.close ?? 0;
    const latestPrice = sortedHistory[sortedHistory.length - 1]?.close ?? 0;

    const priceChange = latestPrice - firstPrice;
    const priceChangePercent = firstPrice
      ? (priceChange / firstPrice) * 100
      : 0;

    return {
      latestPrice,
      firstPrice,
      priceChange,
      priceChangePercent,
      isPositive: priceChange >= 0,
    };
  }, [priceHistory]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="mt-4 flex h-[600px] items-center justify-center border-white/10 bg-black/50 shadow-2xl backdrop-blur-xl">
        <h3 className="text-gray-500">
          No price history available for {symbol}.
        </h3>
      </Card>
    );
  }

  // --- RENDER ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 pt-2 shadow-2xl backdrop-blur-xl"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl"
          style={{ background: backgroundGradient }}
        />
        <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
              {symbol} Performance
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
              <h3 className="text-3xl font-bold text-white">
                ₹{latestPrice.toFixed(2)}
              </h3>
              <div
                className={`flex items-center gap-1.5 text-sm font-semibold ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* --- Sleek Segmented Control for Chart Type --- */}
          <div className="flex space-x-1 rounded-lg bg-gray-800/60 p-1">
            {["line", "area"].map((item) => (
              <button
                key={item}
                onClick={() =>
                  dispatch({
                    type: "SET_CHART_TYPE",
                    payload: item as "line" | "area",
                  })
                }
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  chartType === item
                    ? "text-cyan-300"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {chartType === item && (
                  <motion.div
                    layoutId="chartTypePill"
                    className="absolute inset-0 z-0 rounded-md bg-gray-700/50"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 capitalize">
                  {item === "line" ? (
                    <LineChartIcon className="h-4 w-4" />
                  ) : (
                    <AreaChart className="h-4 w-4" />
                  )}
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0 pt-4 sm:p-4">
          <div className="h-[55vh] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={THEME.primary}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={THEME.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.05)"
                />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={formatXAxis}
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  orientation="left"
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) => `₹ ${v.toFixed(2)}`} // note: "₹ " with a non-breaking space
                  tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                  axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                />
                <ChartTooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: THEME.primary,
                    strokeDasharray: "3 3",
                    strokeWidth: 1,
                  }}
                />

                {buyPrice && (
                  <ReferenceLine
                    y={buyPrice}
                    stroke={THEME.positive}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Buy @ ₹${buyPrice}`,
                      position: "insideTopRight",
                      fill: THEME.positive,
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                )}

                {sellPrice && (
                  <ReferenceLine
                    y={sellPrice}
                    stroke={THEME.negative}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Sell @ ₹${sellPrice}`,
                      position: "insideTopRight",
                      fill: THEME.negative,
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                )}

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
                        name={ind.name}
                      />
                    )
                )}

                {chartType === "area" ? (
                  <Area
                    type="monotone"
                    dataKey="close"
                    name="Price"
                    stroke={THEME.primary}
                    strokeWidth={2.5}
                    fill="url(#areaGradient)"
                    activeDot={{
                      r: 6,
                      fill: THEME.primary,
                      stroke: "#000",
                      strokeWidth: 2,
                    }}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="close"
                    name="Price"
                    stroke={THEME.primary}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: THEME.primary,
                      stroke: "#000",
                      strokeWidth: 2,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* --- Technical Indicators & Stats --- */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-semibold text-gray-300">
                Indicators:
              </span>
              {indicatorSettings.map((ind) => (
                <div key={ind.id} className="relative">
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-gray-800/60 p-1.5 pr-2.5">
                    <input
                      type="checkbox"
                      id={ind.id}
                      checked={ind.enabled}
                      onChange={() =>
                        dispatch({ type: "TOGGLE_INDICATOR", payload: ind.id })
                      }
                      className="peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-cyan-400 bg-transparent checked:border-0 checked:bg-cyan-400 focus:outline-none"
                    />
                    <label
                      htmlFor={ind.id}
                      className="cursor-pointer text-sm text-gray-200 peer-checked:text-white"
                    >
                      {ind.name}
                    </label>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "SET_ACTIVE_SETTINGS",
                          payload: activeSettings === ind.id ? null : ind.id,
                        })
                      }
                      className="ml-1 text-gray-400 transition-colors hover:text-cyan-300"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>

                  {activeSettings === ind.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 top-full z-20 mt-2 w-40 rounded-lg border border-white/10 bg-black/80 p-3 shadow-xl backdrop-blur-md"
                    >
                      <label className="mb-1 block text-xs font-semibold text-gray-400">
                        Period ({ind.period})
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="200"
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
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-cyan-400"
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-center">
              {[
                {
                  label: "Highest",
                  value: `₹${Math.max(
                    ...priceHistory.map((p) => p.high)
                  ).toFixed(2)}`,
                },
                {
                  label: "Lowest",
                  value: `₹${Math.min(
                    ...priceHistory.map((p) => p.low)
                  ).toFixed(2)}`,
                },
                {
                  label: "Total Change",
                  value: `${isPositive ? "+" : ""}${priceChangePercent.toFixed(
                    2
                  )}%`,
                  color: isPositive ? "text-emerald-400" : "text-rose-400",
                },
                { label: "Data Points", value: priceHistory.length },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-start">
                  <div className="text-xs uppercase font-semibold tracking-wide text-gray-400">
                    {stat.label}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      stat.color || "text-white"
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
