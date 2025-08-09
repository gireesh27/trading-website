"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 via-gray-900/60 to-black/80 text-white backdrop-blur-md border border-gray-700 shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-center font-bold text-lg drop-shadow-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            📊 Stylish 3D Holdings Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          {loading ? (
            <p className="text-white text-center">Loading chart...</p>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  {GRADIENTS.map(([start, end], i) => (
                    <linearGradient id={`grad-${i}`} key={i} x1="0" y1="0" x2="1" y2="1">
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
                  outerRadius={110}
                  innerRadius={55}
                  stroke="#1f2937"
                  strokeWidth={2}
                  animationBegin={100}
                  animationDuration={800}
                  labelLine={true} // ✅ outside label lines
                  label={renderSmartLabel} // ✅ safe trimmed labels
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
