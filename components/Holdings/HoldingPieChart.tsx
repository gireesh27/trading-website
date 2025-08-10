"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

  // Dynamically set radius based on screen size
  const outerRadius = isLg ? 110 : isMd ? 90 : isSm ? 70 : 50;
  const innerRadius = isLg ? 55 : isMd ? 45 : isSm ? 35 : 25;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-full px-4 md:px-6 lg:px-8"
    >
      <Card className="bg-gradient-to-br from-slate-900/80 via-gray-900/60 to-black/80 text-white backdrop-blur-md border border-gray-700 shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-center font-bold text-lg drop-shadow-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            📊 Stylish 3D Holdings Distribution
          </CardTitle>
        </CardHeader>
        {/* Responsive height: 40vh mobile, 50vh md, 60vh lg */}
        <CardContent
          className="h-[40vh] md:h-[50vh] lg:h-[60vh] xl:h-[55vh]"
          style={{ minHeight: 300 }}
        >
          {loading ? (
            <p className="text-white text-center">Loading chart...</p>
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
                  animationDuration={800}
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
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value, _name, props) => [
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
            <p className="text-gray-300 text-center">No holdings data available.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
