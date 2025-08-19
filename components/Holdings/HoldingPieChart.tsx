"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { FaCoins } from "react-icons/fa";
import useMediaQuery from "@/lib/utils/mediaQuery";

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice?: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

const GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#22d3ee", "#0ea5e9"],
  ["#f43f5e", "#ec4899"],
  ["#facc15", "#f97316"],
  ["#34d399", "#10b981"],
  ["#a855f7", "#6366f1"],
];

// ✅ Smart label function
const renderSmartLabel = ({ name, value, x, y, textAnchor }: any) => {
  const shortName = name.length > 8 ? `${name.slice(0, 6)}…` : name;
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      fontSize={12}
      fontWeight="600"
      textAnchor={textAnchor}
      dominantBaseline="central"
    >
      {`${shortName} ₹${Number(value).toFixed(2)}`}
    </text>
  );
};

export default function HoldingsPieChart({
  holdings,
  loading,
}: {
  holdings: Holding[];
  loading: boolean;
}) {
  const chartData = holdings.map((h) => ({
    name: h.symbol,
    quantity: h.quantity,
    avgPrice: h.avgPrice,
    value: Number(h.totalInvested.toFixed(3)),
  }));

  const isSm = useMediaQuery("(min-width: 640px)"); // sm breakpoint
  const isMd = useMediaQuery("(min-width: 768px)"); // md breakpoint
  const isLg = useMediaQuery("(min-width: 1024px)"); // lg breakpoint

  const outerRadius = isLg ? 110 : isMd ? 90 : isSm ? 70 : 50;
  const innerRadius = isLg ? 55 : isMd ? 45 : isSm ? 35 : 25;

  return (
    <div className="relative ">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 "
      >
        <Card className="bg-gray-900/50 relative backdrop-blur-xl border border-gray-800  rounded-2xl w-full max-w-lg mx-auto shadow-2xl shadow-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-center">
            <FaCoins className="text-yellow-400" size={20} />
            <CardTitle className="text-white text-center font-bold text-xl drop-shadow-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              &nbsp; Holdings Distribution 
            </CardTitle>
          </CardHeader>

          <CardContent
            className="h-[40vh] md:h-[50vh] lg:h-[60vh] xl:h-[55vh]"
            style={{ minHeight: 300 }}
          >
            {loading ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-center animate-pulse"
              >
                Loading chart...
              </motion.p>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    {GRADIENTS.map(([start, end], i: number) => (
                      <linearGradient
                        id={`grad-${i}`}
                        key={i}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={start} />
                        <stop offset="100%" stopColor={end} />
                      </linearGradient>
                    ))}
                  </defs>

                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    stroke="#1f2937"
                    strokeWidth={2}
                    animationBegin={100}
                    animationDuration={1000}
                    labelLine={true}
                    label={renderSmartLabel}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#grad-${index % GRADIENTS.length})`}
                        style={{
                          filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.4))",
                        }}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(31,41,55,0.9)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "12px",
                      padding: "10px",
                    }}
                    itemStyle={{
                      color: "#fff", // ✅ ensures tooltip text is visible
                      fontWeight: 500,
                      fontSize: "14px",
                    }}
                    labelStyle={{
                      color: "#93c5fd", // ✅ stylish label color (sky-400)
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                    formatter={(value: number, _name: string, props: any) => [
                      `₹${Number(value).toLocaleString()}`,
                      `${props.payload.quantity} shares @ ₹${props.payload.avgPrice}`,
                    ]}
                  />

                  <Legend
                    wrapperStyle={{
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-300 text-center">
                No holdings data available.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
